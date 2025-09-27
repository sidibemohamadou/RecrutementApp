import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage } from '../server/storage';
import { AuthService } from '../server/auth';
import { UserManagementService } from '../server/userManagementService';

describe('User Management Service', () => {
  let testUsers: string[] = [];

  afterEach(async () => {
    // Cleanup test users
    for (const userId of testUsers) {
      try {
        await storage.deleteUser(userId);
      } catch (error) {
        console.log('Cleanup user error:', error);
      }
    }
    testUsers = [];
  });

  describe('Permissions System', () => {
    it('should return correct permissions for admin role', () => {
      const permissions = UserManagementService.getUserPermissions('admin');
      
      expect(permissions.canCreateUsers).toBe(true);
      expect(permissions.canDeleteUsers).toBe(true);
      expect(permissions.canManageRoles).toContain('admin');
      expect(permissions.canManageRoles).toContain('hr');
      expect(permissions.canManageRoles).toContain('recruiter');
      expect(permissions.accessibleModules).toContain('*');
    });

    it('should return limited permissions for hr role', () => {
      const permissions = UserManagementService.getUserPermissions('hr');
      
      expect(permissions.canCreateUsers).toBe(true);
      expect(permissions.canDeleteUsers).toBe(false);
      expect(permissions.canManageRoles).not.toContain('admin');
      expect(permissions.canManageRoles).toContain('employee');
      expect(permissions.canManageRoles).toContain('candidate');
    });

    it('should return minimal permissions for recruiter role', () => {
      const permissions = UserManagementService.getUserPermissions('recruiter');
      
      expect(permissions.canCreateUsers).toBe(false);
      expect(permissions.canDeleteUsers).toBe(false);
      expect(permissions.canManageRoles).toEqual([]);
      expect(permissions.canViewUsers).toContain('candidate');
    });
  });

  describe('User Creation with Permissions', () => {
    it('should allow admin to create any type of user', async () => {
      const adminUser = await storage.createUser({
        email: 'admin.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Admin',
        lastName: 'Test',
        role: 'admin'
      });
      testUsers.push(adminUser.id);

      const canCreateHR = UserManagementService.canCreateUserWithRole('admin', 'hr');
      const canCreateRecruiter = UserManagementService.canCreateUserWithRole('admin', 'recruiter');
      const canCreateAdmin = UserManagementService.canCreateUserWithRole('admin', 'admin');

      expect(canCreateHR).toBe(true);
      expect(canCreateRecruiter).toBe(true);
      expect(canCreateAdmin).toBe(true);
    });

    it('should restrict hr from creating admin users', () => {
      const canCreateAdmin = UserManagementService.canCreateUserWithRole('hr', 'admin');
      const canCreateRecruiter = UserManagementService.canCreateUserWithRole('hr', 'recruiter');
      const canCreateEmployee = UserManagementService.canCreateUserWithRole('hr', 'employee');

      expect(canCreateAdmin).toBe(false);
      expect(canCreateRecruiter).toBe(false);
      expect(canCreateEmployee).toBe(true);
    });

    it('should prevent recruiters from creating any users', () => {
      const canCreateAny = UserManagementService.canCreateUserWithRole('recruiter', 'candidate');
      expect(canCreateAny).toBe(false);
    });
  });

  describe('User Management Operations', () => {
    it('should create user with proper validation', async () => {
      const adminUser = await storage.createUser({
        email: 'admin.create.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Admin',
        lastName: 'Creator',
        role: 'admin'
      });
      testUsers.push(adminUser.id);

      const userData = {
        email: 'new.hr@example.com',
        password: 'securepassword123',
        firstName: 'New',
        lastName: 'HR',
        role: 'hr',
        phone: '+221771234567'
      };

      const newUser = await UserManagementService.createUser(
        { id: adminUser.id, role: 'admin' },
        userData
      );

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe(userData.email);
      expect(newUser.role).toBe('hr');
      expect(newUser.profileCompleted).toBe(true); // Non-candidates have completed profile by default
      testUsers.push(newUser.id);
    });

    it('should prevent unauthorized user creation', async () => {
      const recruiterUser = await storage.createUser({
        email: 'recruiter.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Recruiter',
        lastName: 'Test',
        role: 'recruiter'
      });
      testUsers.push(recruiterUser.id);

      const userData = {
        email: 'unauthorized.admin@example.com',
        password: 'password123',
        firstName: 'Unauthorized',
        lastName: 'Admin',
        role: 'admin'
      };

      await expect(
        UserManagementService.createUser(
          { id: recruiterUser.id, role: 'recruiter' },
          userData
        )
      ).rejects.toThrow('Vous n\'avez pas les permissions');
    });

    it('should prevent duplicate email creation', async () => {
      const adminUser = await storage.createUser({
        email: 'admin.duplicate.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Admin',
        lastName: 'Duplicate',
        role: 'admin'
      });
      testUsers.push(adminUser.id);

      const existingUser = await storage.createUser({
        email: 'existing.user@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Existing',
        lastName: 'User',
        role: 'candidate'
      });
      testUsers.push(existingUser.id);

      const userData = {
        email: 'existing.user@example.com', // Same email
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: 'candidate'
      };

      await expect(
        UserManagementService.createUser(
          { id: adminUser.id, role: 'admin' },
          userData
        )
      ).rejects.toThrow('Un compte avec cet email existe déjà');
    });
  });

  describe('User Editing Permissions', () => {
    it('should allow authorized user editing', async () => {
      const adminUser = await storage.createUser({
        email: 'admin.edit.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Admin',
        lastName: 'Editor',
        role: 'admin'
      });
      testUsers.push(adminUser.id);

      const targetUser = await storage.createUser({
        email: 'target.user@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Target',
        lastName: 'User',
        role: 'candidate'
      });
      testUsers.push(targetUser.id);

      const canEdit = UserManagementService.canEditUser(
        'admin',
        'candidate',
        targetUser.id,
        adminUser.id
      );

      expect(canEdit).toBe(true);
    });

    it('should prevent self-editing through management interface', () => {
      const canEditSelf = UserManagementService.canEditUser(
        'admin',
        'admin',
        'same-user-id',
        'same-user-id'
      );

      expect(canEditSelf).toBe(false);
    });

    it('should prevent unauthorized editing', () => {
      const canEdit = UserManagementService.canEditUser(
        'recruiter',
        'admin',
        'target-user-id',
        'recruiter-user-id'
      );

      expect(canEdit).toBe(false);
    });
  });

  describe('Available Roles', () => {
    it('should return correct available roles for admin', () => {
      const roles = UserManagementService.getAvailableRoles('admin');
      
      expect(roles.length).toBeGreaterThan(0);
      expect(roles.find(r => r.value === 'admin')).toBeDefined();
      expect(roles.find(r => r.value === 'hr')).toBeDefined();
      expect(roles.find(r => r.value === 'recruiter')).toBeDefined();
    });

    it('should return limited roles for hr', () => {
      const roles = UserManagementService.getAvailableRoles('hr');
      
      expect(roles.find(r => r.value === 'admin')).toBeUndefined();
      expect(roles.find(r => r.value === 'employee')).toBeDefined();
      expect(roles.find(r => r.value === 'candidate')).toBeDefined();
    });

    it('should return no roles for recruiter', () => {
      const roles = UserManagementService.getAvailableRoles('recruiter');
      expect(roles.length).toBe(0);
    });
  });

  describe('Password Generation', () => {
    it('should generate secure temporary password', () => {
      const password = UserManagementService.generateTemporaryPassword();
      
      expect(password).toBeDefined();
      expect(password.length).toBe(12);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/[!@#$%^&*]/.test(password)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user management workflow', async () => {
      // 1. Create admin user
      const adminUser = await storage.createUser({
        email: 'workflow.admin@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Workflow',
        lastName: 'Admin',
        role: 'admin'
      });
      testUsers.push(adminUser.id);

      // 2. Admin creates HR user
      const hrUserData = {
        email: 'workflow.hr@example.com',
        password: 'hrpassword123',
        firstName: 'Workflow',
        lastName: 'HR',
        role: 'hr',
        phone: '+221771234567',
        department: 'RH'
      };

      const hrUser = await UserManagementService.createUser(
        { id: adminUser.id, role: 'admin' },
        hrUserData
      );
      testUsers.push(hrUser.id);

      expect(hrUser.role).toBe('hr');
      expect(hrUser.profileCompleted).toBe(true);

      // 3. HR creates employee
      const employeeUserData = {
        email: 'workflow.employee@example.com',
        password: 'employeepassword123',
        firstName: 'Workflow',
        lastName: 'Employee',
        role: 'employee',
        department: 'Aviation'
      };

      const employeeUser = await UserManagementService.createUser(
        { id: hrUser.id, role: 'hr' },
        employeeUserData
      );
      testUsers.push(employeeUser.id);

      expect(employeeUser.role).toBe('employee');

      // 4. HR tries to create admin (should fail)
      const adminUserData = {
        email: 'unauthorized.admin@example.com',
        password: 'password123',
        firstName: 'Unauthorized',
        lastName: 'Admin',
        role: 'admin'
      };

      await expect(
        UserManagementService.createUser(
          { id: hrUser.id, role: 'hr' },
          adminUserData
        )
      ).rejects.toThrow('Vous n\'avez pas les permissions');

      // 5. Update employee information
      const updatedEmployee = await UserManagementService.updateUser(
        { id: hrUser.id, role: 'hr' },
        employeeUser.id,
        { phone: '+221771234568', department: 'Maintenance' }
      );

      expect(updatedEmployee.phone).toBe('+221771234568');

      // 6. Verify accessible users for HR
      const accessibleUsers = await UserManagementService.getAccessibleUsers(
        { id: hrUser.id, role: 'hr' }
      );

      expect(accessibleUsers.length).toBeGreaterThan(0);
      expect(accessibleUsers.find(u => u.id === employeeUser.id)).toBeDefined();
    });
  });
});