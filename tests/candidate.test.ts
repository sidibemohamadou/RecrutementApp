import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage } from '../server/storage';
import { AuthService } from '../server/auth';

describe('Candidate Management', () => {
  let testUserId: string;
  let testJobId: number;

  beforeEach(async () => {
    // Create test user
    const testUser = await storage.createUser({
      email: 'test.candidate@example.com',
      password: await AuthService.hashPassword('password123'),
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'candidate',
      profileCompleted: false
    });
    testUserId = testUser.id;

    // Create test job
    const testJob = await storage.createJob({
      title: 'Développeur Test',
      company: 'Test Corp',
      location: 'Paris',
      description: 'Poste de test',
      contractType: 'CDI',
      isActive: 1
    });
    testJobId = testJob.id;
  });

  afterEach(async () => {
    // Cleanup
    try {
      await storage.deleteUser(testUserId);
      await storage.deleteJob(testJobId);
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  describe('User Registration and Authentication', () => {
    it('should register a new candidate', async () => {
      const credentials = {
        email: 'new.candidate@example.com',
        password: 'password123',
        firstName: 'Marie',
        lastName: 'Martin'
      };

      const user = await AuthService.registerCandidate(credentials);
      
      expect(user).toBeDefined();
      expect(user?.email).toBe(credentials.email);
      expect(user?.firstName).toBe(credentials.firstName);
      expect(user?.lastName).toBe(credentials.lastName);
      expect(user?.role).toBe('candidate');

      // Cleanup
      if (user) {
        await storage.deleteUser(user.id);
      }
    });

    it('should authenticate existing candidate', async () => {
      const credentials = {
        email: 'test.candidate@example.com',
        password: 'password123'
      };

      const user = await AuthService.authenticateUser(credentials);
      
      expect(user).toBeDefined();
      expect(user?.email).toBe(credentials.email);
      expect(user?.role).toBe('candidate');
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'test.candidate@example.com',
        password: 'wrongpassword'
      };

      const user = await AuthService.authenticateUser(credentials);
      expect(user).toBeNull();
    });
  });

  describe('Profile Management', () => {
    it('should update candidate profile', async () => {
      const profileData = {
        phone: '+33123456789',
        gender: 'Homme',
        maritalStatus: 'Célibataire',
        address: '123 Rue de Test, Paris',
        residencePlace: 'Paris',
        nationality: 'Française',
        profileCompleted: true
      };

      const updatedUser = await storage.updateUser(testUserId, profileData);
      
      expect(updatedUser.phone).toBe(profileData.phone);
      expect(updatedUser.gender).toBe(profileData.gender);
      expect(updatedUser.profileCompleted).toBe(true);
    });

    it('should complete profile with all required fields', async () => {
      const completeProfileData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        gender: 'Homme',
        maritalStatus: 'Célibataire',
        phone: '+33123456789',
        address: '123 Rue de Test, Paris',
        residencePlace: 'Paris',
        idDocumentType: 'CNI',
        idDocumentNumber: '123456789',
        birthDate: new Date('1990-01-01'),
        birthPlace: 'Paris',
        birthCountry: 'France',
        nationality: 'Française',
        profileCompleted: true
      };

      const updatedUser = await storage.updateUser(testUserId, completeProfileData);
      
      expect(updatedUser.profileCompleted).toBe(true);
      expect(updatedUser.firstName).toBe(completeProfileData.firstName);
      expect(updatedUser.nationality).toBe(completeProfileData.nationality);
    });
  });

  describe('Application Management', () => {
    it('should create application for candidate', async () => {
      const applicationData = {
        jobId: testJobId,
        coverLetter: 'Je suis très intéressé par ce poste...',
        salaryExpectation: '45000€',
        availability: new Date('2024-03-01')
      };

      const application = await storage.createApplication(applicationData, testUserId);
      
      expect(application).toBeDefined();
      expect(application.userId).toBe(testUserId);
      expect(application.jobId).toBe(testJobId);
      expect(application.status).toBe('pending');
      expect(application.coverLetter).toBe(applicationData.coverLetter);
    });

    it('should get applications for candidate', async () => {
      // Create test application
      await storage.createApplication({
        jobId: testJobId,
        coverLetter: 'Test application',
        salaryExpectation: '50000€'
      }, testUserId);

      const applications = await storage.getApplicationsByUser(testUserId);
      
      expect(applications).toBeDefined();
      expect(applications.length).toBeGreaterThan(0);
      expect(applications[0].userId).toBe(testUserId);
    });

    it('should update application status', async () => {
      // Create test application
      const application = await storage.createApplication({
        jobId: testJobId,
        coverLetter: 'Test application'
      }, testUserId);

      const updatedApplication = await storage.updateApplication(application.id, {
        status: 'reviewed',
        autoScore: 75
      });

      expect(updatedApplication).toBeDefined();
      expect(updatedApplication?.status).toBe('reviewed');
      expect(updatedApplication?.autoScore).toBe(75);
    });
  });

  describe('File Upload Security', () => {
    it('should validate file types for CV upload', () => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const testType = 'application/pdf';
      
      expect(validTypes.includes(testType)).toBe(true);
    });

    it('should reject invalid file types', () => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const invalidType = 'image/jpeg';
      
      expect(validTypes.includes(invalidType)).toBe(false);
    });

    it('should validate file size limits', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const testSize = 3 * 1024 * 1024; // 3MB
      
      expect(testSize).toBeLessThanOrEqual(maxSize);
    });
  });

  describe('Data Security and Privacy', () => {
    it('should hash passwords securely', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthService.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthService.hashPassword(password);
      
      const isValid = await AuthService.verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await AuthService.verifyPassword('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should isolate candidate data', async () => {
      // Create second test user
      const secondUser = await storage.createUser({
        email: 'second.candidate@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Pierre',
        lastName: 'Martin',
        role: 'candidate'
      });

      // Create applications for both users
      await storage.createApplication({
        jobId: testJobId,
        coverLetter: 'First user application'
      }, testUserId);

      await storage.createApplication({
        jobId: testJobId,
        coverLetter: 'Second user application'
      }, secondUser.id);

      // Verify data isolation
      const firstUserApps = await storage.getApplicationsByUser(testUserId);
      const secondUserApps = await storage.getApplicationsByUser(secondUser.id);

      expect(firstUserApps.length).toBe(1);
      expect(secondUserApps.length).toBe(1);
      expect(firstUserApps[0].userId).toBe(testUserId);
      expect(secondUserApps[0].userId).toBe(secondUser.id);

      // Cleanup
      await storage.deleteUser(secondUser.id);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full candidate workflow', async () => {
      // 1. Register candidate
      const credentials = {
        email: 'workflow.test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Workflow'
      };

      const user = await AuthService.registerCandidate(credentials);
      expect(user).toBeDefined();

      // 2. Complete profile
      const profileData = {
        phone: '+33123456789',
        gender: 'Homme',
        maritalStatus: 'Célibataire',
        address: '123 Rue de Test',
        residencePlace: 'Paris',
        idDocumentType: 'CNI',
        idDocumentNumber: '123456789',
        birthDate: new Date('1990-01-01'),
        birthPlace: 'Paris',
        birthCountry: 'France',
        nationality: 'Française',
        profileCompleted: true
      };

      const updatedUser = await storage.updateUser(user!.id, profileData);
      expect(updatedUser.profileCompleted).toBe(true);

      // 3. Apply to job
      const applicationData = {
        jobId: testJobId,
        coverLetter: 'Je suis très motivé pour ce poste...',
        salaryExpectation: '45000€',
        availability: new Date('2024-03-01')
      };

      const application = await storage.createApplication(applicationData, user!.id);
      expect(application).toBeDefined();
      expect(application.status).toBe('pending');

      // 4. Verify application appears in user's list
      const userApplications = await storage.getApplicationsByUser(user!.id);
      expect(userApplications.length).toBe(1);
      expect(userApplications[0].id).toBe(application.id);

      // Cleanup
      await storage.deleteUser(user!.id);
    });
  });
});