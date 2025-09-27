import { AuthService } from "./auth";
import { storage } from "./storage";
import type { User } from "@shared/schema";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  department?: string;
}

export interface UserPermissions {
  canCreateUsers: boolean;
  canManageRoles: string[];
  canViewUsers: string[];
  canEditUsers: string[];
  canDeleteUsers: boolean;
  accessibleModules: string[];
}

export class UserManagementService {
  /**
   * Définit les permissions selon le rôle de l'utilisateur
   */
  static getUserPermissions(userRole: string): UserPermissions {
    switch (userRole) {
      case "admin":
        return {
          canCreateUsers: true,
          canManageRoles: ["admin", "hr", "recruiter", "manager", "employee", "candidate"],
          canViewUsers: ["admin", "hr", "recruiter", "manager", "employee", "candidate"],
          canEditUsers: ["admin", "hr", "recruiter", "manager", "employee", "candidate"],
          canDeleteUsers: true,
          accessibleModules: ["*"] // Accès complet
        };
      
      case "hr":
        return {
          canCreateUsers: true,
          canManageRoles: ["employee", "candidate"],
          canViewUsers: ["hr", "recruiter", "employee", "candidate"],
          canEditUsers: ["employee", "candidate"],
          canDeleteUsers: false,
          accessibleModules: [
            "candidates", "applications", "employees", "payroll", 
            "contracts", "onboarding", "performance"
          ]
        };
      
      case "recruiter":
        return {
          canCreateUsers: false,
          canManageRoles: [],
          canViewUsers: ["candidate"],
          canEditUsers: [],
          canDeleteUsers: false,
          accessibleModules: ["candidates", "applications", "interviews", "scoring"]
        };
      
      case "manager":
        return {
          canCreateUsers: false,
          canManageRoles: [],
          canViewUsers: ["employee"],
          canEditUsers: [],
          canDeleteUsers: false,
          accessibleModules: ["team", "performance", "reports"]
        };
      
      default:
        return {
          canCreateUsers: false,
          canManageRoles: [],
          canViewUsers: [],
          canEditUsers: [],
          canDeleteUsers: false,
          accessibleModules: []
        };
    }
  }

  /**
   * Vérifie si un utilisateur peut créer un autre utilisateur avec un rôle donné
   */
  static canCreateUserWithRole(currentUserRole: string, targetRole: string): boolean {
    const permissions = this.getUserPermissions(currentUserRole);
    return permissions.canCreateUsers && permissions.canManageRoles.includes(targetRole);
  }

  /**
   * Vérifie si un utilisateur peut modifier un autre utilisateur
   */
  static canEditUser(currentUserRole: string, targetUserRole: string, targetUserId: string, currentUserId: string): boolean {
    // Un utilisateur ne peut pas se modifier lui-même via cette interface
    if (targetUserId === currentUserId) {
      return false;
    }

    const permissions = this.getUserPermissions(currentUserRole);
    return permissions.canEditUsers.includes(targetUserRole);
  }

  /**
   * Vérifie si un utilisateur peut supprimer un autre utilisateur
   */
  static canDeleteUser(currentUserRole: string, targetUserId: string, currentUserId: string): boolean {
    // Un utilisateur ne peut pas se supprimer lui-même
    if (targetUserId === currentUserId) {
      return false;
    }

    const permissions = this.getUserPermissions(currentUserRole);
    return permissions.canDeleteUsers;
  }

  /**
   * Crée un nouvel utilisateur avec validation des permissions
   */
  static async createUser(
    currentUser: { id: string; role: string },
    userData: CreateUserData
  ): Promise<User> {
    // Vérifier les permissions
    if (!this.canCreateUserWithRole(currentUser.role, userData.role)) {
      throw new Error(`Vous n'avez pas les permissions pour créer un utilisateur avec le rôle ${userData.role}`);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Un compte avec cet email existe déjà");
    }

    // Hasher le mot de passe
    const hashedPassword = await AuthService.hashPassword(userData.password);

    // Créer l'utilisateur
    const newUser = await storage.createUser({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      profileCompleted: userData.role !== "candidate" // Les non-candidats ont le profil complété par défaut
    });

    return newUser;
  }

  /**
   * Met à jour un utilisateur avec validation des permissions
   */
  static async updateUser(
    currentUser: { id: string; role: string },
    targetUserId: string,
    updateData: Partial<User>
  ): Promise<User> {
    const targetUser = await storage.getUser(targetUserId);
    if (!targetUser) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier les permissions
    if (!this.canEditUser(currentUser.role, targetUser.role || "candidate", targetUserId, currentUser.id)) {
      throw new Error("Vous n'avez pas les permissions pour modifier cet utilisateur");
    }

    // Si on modifie le rôle, vérifier les permissions
    if (updateData.role && updateData.role !== targetUser.role) {
      if (!this.canCreateUserWithRole(currentUser.role, updateData.role)) {
        throw new Error(`Vous n'avez pas les permissions pour attribuer le rôle ${updateData.role}`);
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await storage.updateUser(targetUserId, updateData);
    return updatedUser;
  }

  /**
   * Supprime un utilisateur avec validation des permissions
   */
  static async deleteUser(
    currentUser: { id: string; role: string },
    targetUserId: string
  ): Promise<void> {
    // Vérifier les permissions
    if (!this.canDeleteUser(currentUser.role, targetUserId, currentUser.id)) {
      throw new Error("Vous n'avez pas les permissions pour supprimer cet utilisateur");
    }

    await storage.deleteUser(targetUserId);
  }

  /**
   * Récupère les utilisateurs que l'utilisateur actuel peut voir
   */
  static async getAccessibleUsers(currentUser: { id: string; role: string }): Promise<User[]> {
    const permissions = this.getUserPermissions(currentUser.role);
    
    if (permissions.canViewUsers.includes("*") || currentUser.role === "admin") {
      return storage.getAllUsers();
    }

    const allUsers = await storage.getAllUsers();
    return allUsers.filter(user => 
      permissions.canViewUsers.includes(user.role || "candidate")
    );
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   */
  static generateTemporaryPassword(): string {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Récupère les rôles disponibles pour création selon les permissions
   */
  static getAvailableRoles(currentUserRole: string): Array<{ value: string; label: string; description: string }> {
    const permissions = this.getUserPermissions(currentUserRole);
    
    const allRoles = [
      { 
        value: "admin", 
        label: "Super Administrateur", 
        description: "Accès complet à toutes les fonctionnalités" 
      },
      { 
        value: "hr", 
        label: "Ressources Humaines", 
        description: "Gestion des employés, paie, contrats" 
      },
      { 
        value: "recruiter", 
        label: "Recruteur", 
        description: "Gestion des candidatures et entretiens" 
      },
      { 
        value: "manager", 
        label: "Manager", 
        description: "Supervision d'équipe et reporting" 
      },
      { 
        value: "employee", 
        label: "Employé", 
        description: "Accès employé standard" 
      },
      { 
        value: "candidate", 
        label: "Candidat", 
        description: "Accès candidat pour candidatures" 
      }
    ];

    return allRoles.filter(role => permissions.canManageRoles.includes(role.value));
  }
}