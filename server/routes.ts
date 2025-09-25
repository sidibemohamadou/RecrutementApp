import { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { registerAuthRoutes } from "./authRoutes";
import { insertJobSchema, insertApplicationSchema, updateApplicationSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

export async function registerRoutes(app: Express): Promise<Server> {
  const { createServer } = await import("http");
  
  // Configuration des sessions (nécessaire pour l'authentification)
  const { getSession } = await import("./replitAuth");
  app.use(getSession());
  
  // Enregistrer les routes d'authentification email/password
  registerAuthRoutes(app);

  // Middleware d'authentification simplifié
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionUser = (req.session as any)?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Non connecté" });
    }
    req.user = sessionUser;
    next();
  };

  const requireAdminRole = async (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user?.role || !["admin", "hr", "recruiter"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };

  // ===== ROUTES PUBLIQUES - JOBS =====
  
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, contractType, experienceLevel, location } = req.query;
      
      if (search || contractType || experienceLevel || location) {
        const filters = {
          contractType: contractType ? (contractType as string).split(',') : [],
          experienceLevel: experienceLevel ? (experienceLevel as string).split(',') : [],
          location: location as string,
        };
        const jobs = await storage.searchJobs(search as string || '', filters);
        res.json(jobs);
      } else {
        const jobs = await storage.getAllJobs();
        res.json(jobs);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // ===== ROUTES CANDIDAT - APPLICATIONS =====
  
  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Validation des données avec le schéma Zod
      const validatedData = insertApplicationSchema.parse(req.body);
      
      // Convert availability string to Date if provided
      if (validatedData.availability && typeof validatedData.availability === 'string') {
        validatedData.availability = new Date(validatedData.availability);
      }
      
      // Création de la candidature via le storage
      const application = await storage.createApplication(validatedData, userId);
      res.status(201).json(application);
    } catch (error: any) {
      console.error("Error creating application:", error);
      
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // ===== ROUTES CANDIDAT - PROFIL =====
  
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Ne pas retourner le mot de passe
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const profileData = req.body;
      const updatedUser = await storage.updateUser(userId, profileData);
      
      // Ne pas retourner le mot de passe
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/profile/complete", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = {
        ...req.body,
        profileCompleted: true
      };
      
      const updatedUser = await storage.updateUser(userId, profileData);
      
      // Ne pas retourner le mot de passe
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  // ===== ROUTES UPLOAD DE FICHIERS =====
  
  app.get("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.put("/api/documents", requireAuth, async (req: any, res) => {
    try {
      if (!req.body.documentURL) {
        return res.status(400).json({ error: "documentURL is required" });
      }

      const userId = req.user?.id;

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.documentURL,
        {
          owner: userId,
          visibility: "private", // Documents are private to the user
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // ===== ROUTES ADMIN - JOBS =====
  
  app.get("/api/admin/jobs", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching admin jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/admin/jobs", requireAuth, requireAdminRole, async (req, res) => {
    try {
      // Validation des données avec le schéma Zod
      const validatedData = insertJobSchema.parse(req.body);
      
      // Création de l'emploi via le storage
      const newJob = await storage.createJob(validatedData);
      
      res.status(201).json(newJob);
    } catch (error: any) {
      console.error("Error creating job:", error);
      
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/admin/jobs/:id", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "ID d'emploi invalide" });
      }

      // Validation partielle des données avec le schéma Zod
      const validatedData = insertJobSchema.partial().parse(req.body);
      
      // Mise à jour de l'emploi via le storage
      const updatedJob = await storage.updateJob(jobId, validatedData);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Emploi non trouvé" });
      }
      
      res.json(updatedJob);
    } catch (error: any) {
      console.error("Error updating job:", error);
      
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/admin/jobs/:id", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "ID d'emploi invalide" });
      }

      const deleted = await storage.deleteJob(jobId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Emploi non trouvé" });
      }
      
      res.json({ message: "Emploi supprimé avec succès" });
    } catch (error: any) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // ===== ROUTES ADMIN - APPLICATIONS =====
  
  app.get("/api/admin/applications", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching admin applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch("/api/admin/applications/:id", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ message: "ID de candidature invalide" });
      }

      // Validation partielle des données avec le schéma Zod
      const validatedData = updateApplicationSchema.parse(req.body);
      
      // Mise à jour de la candidature via le storage
      const updatedApplication = await storage.updateApplication(applicationId, validatedData);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }
      
      res.json(updatedApplication);
    } catch (error: any) {
      console.error("Error updating application:", error);
      
      if (error?.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete("/api/admin/applications/:id", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ message: "ID de candidature invalide" });
      }

      const deleted = await storage.deleteApplication(applicationId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }
      
      res.json({ message: "Candidature supprimée avec succès" });
    } catch (error: any) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // ===== ROUTES RECRUTEMENT =====
  
  app.get("/api/admin/recruiters", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const recruiters = await storage.getRecruiters();
      res.json(recruiters);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      res.status(500).json({ message: "Failed to fetch recruiters" });
    }
  });

  app.get("/api/admin/top-candidates/:jobId", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const { recruitmentService } = await import("./recruitmentService");
      const jobId = parseInt(req.params.jobId);
      const topCandidates = await recruitmentService.getTopCandidates(jobId);
      res.json(topCandidates);
    } catch (error) {
      console.error("Error fetching top candidates:", error);
      res.status(500).json({ message: "Failed to fetch top candidates" });
    }
  });

  app.post("/api/admin/assign-candidates", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const { recruitmentService } = await import("./recruitmentService");
      const { applicationIds, recruiterId } = req.body;
      
      if (!applicationIds || !recruiterId) {
        return res.status(400).json({ error: "applicationIds and recruiterId are required" });
      }
      
      await recruitmentService.assignCandidatesToRecruiter(applicationIds, recruiterId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning candidates:", error);
      res.status(500).json({ message: "Failed to assign candidates" });
    }
  });

  app.get("/api/recruiter/assigned-candidates", requireAuth, async (req: any, res) => {
    try {
      const { recruitmentService } = await import("./recruitmentService");
      const userId = req.user.id;
      const assignedCandidates = await recruitmentService.getAssignedApplications(userId);
      res.json(assignedCandidates);
    } catch (error) {
      console.error("Error fetching assigned candidates:", error);
      res.status(500).json({ message: "Failed to fetch assigned candidates" });
    }
  });

  app.put("/api/recruiter/score/:applicationId", requireAuth, async (req: any, res) => {
    try {
      const { recruitmentService } = await import("./recruitmentService");
      const applicationId = parseInt(req.params.applicationId);
      const { score, notes } = req.body;
      
      if (score === undefined) {
        return res.status(400).json({ error: "Score is required" });
      }
      
      await recruitmentService.updateManualScore(applicationId, score, notes);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating manual score:", error);
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  app.get("/api/admin/final-top3/:jobId", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const { recruitmentService } = await import("./recruitmentService");
      const jobId = parseInt(req.params.jobId);
      const finalTop3 = await recruitmentService.getFinalTop3(jobId);
      res.json(finalTop3);
    } catch (error) {
      console.error("Error fetching final top 3:", error);
      res.status(500).json({ message: "Failed to fetch final results" });
    }
  });

  // ===== ROUTES ANALYTICS =====
  
  app.get("/api/admin/kpis", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const kpis = await storage.getKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  app.get("/api/admin/analytics/applications", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const analytics = await storage.getApplicationAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching application analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/analytics/jobs", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const jobAnalytics = await storage.getJobAnalytics();
      res.json(jobAnalytics);
    } catch (error) {
      console.error("Error fetching job analytics:", error);
      res.status(500).json({ message: "Failed to fetch job analytics" });
    }
  });

  // ===== ROUTES GESTION UTILISATEURS =====
  
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { role } = req.query;
      const users = role ? await storage.getUsersByRole(role as string) : await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { id } = req.params;
      const updateData = req.body;
      
      // Ne pas permettre de modifier son propre rôle
      if (id === req.user.id && updateData.role && updateData.role !== currentUser.role) {
        return res.status(400).json({ message: "Cannot modify your own role" });
      }
      
      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }
      
      const { id } = req.params;
      
      // Ne pas permettre de supprimer son propre compte
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ===== ROUTES GESTION PAIE =====
  
  app.get("/api/payroll", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["admin", "hr"].includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const payrolls = await storage.getAllPayrolls();
      res.json(payrolls);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      res.status(500).json({ message: "Failed to fetch payrolls" });
    }
  });

  app.post("/api/payroll", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["admin", "hr"].includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const payrollData = {
        ...req.body,
        createdBy: user.id
      };
      
      const newPayroll = await storage.createPayroll(payrollData);
      res.status(201).json(newPayroll);
    } catch (error) {
      console.error("Error creating payroll:", error);
      res.status(500).json({ message: "Failed to create payroll" });
    }
  });

  app.put("/api/payroll/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["admin", "hr"].includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const payrollId = parseInt(req.params.id);
      const updatedPayroll = await storage.updatePayroll(payrollId, req.body);
      res.json(updatedPayroll);
    } catch (error) {
      console.error("Error updating payroll:", error);
      res.status(500).json({ message: "Failed to update payroll" });
    }
  });

  app.post("/api/payroll/:id/send-email", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["admin", "hr"].includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const payrollId = parseInt(req.params.id);
      const { email, customMessage } = req.body;
      
      // TODO: Implémenter envoi email du bulletin de paie
      res.json({ message: "Email sending not implemented yet" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // ===== ROUTES EMPLOYÉS =====
  
  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["admin", "hr"].includes(user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // ===== ROUTES ONBOARDING =====
  
  app.get("/api/onboarding/processes", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const processes = await storage.getAllOnboardingProcesses();
      res.json(processes);
    } catch (error) {
      console.error("Error fetching onboarding processes:", error);
      res.status(500).json({ message: "Failed to fetch onboarding processes" });
    }
  });

  app.post("/api/onboarding/processes", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const processData = { ...req.body, createdBy: req.user.id };
      const newProcess = await storage.createOnboardingProcess(processData);
      res.status(201).json(newProcess);
    } catch (error) {
      console.error("Error creating onboarding process:", error);
      res.status(500).json({ message: "Failed to create onboarding process" });
    }
  });

  app.get("/api/onboarding/candidates/user/:userId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = await storage.getUser(req.user.id);
      
      // L'utilisateur peut voir son propre onboarding ou admin/hr peuvent voir tous
      if (userId !== req.user.id && 
          (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr'))) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const onboardings = await storage.getCandidateOnboardingByUser(userId);
      res.json(onboardings);
    } catch (error) {
      console.error("Error fetching candidate onboarding:", error);
      res.status(500).json({ message: "Failed to fetch candidate onboarding" });
    }
  });

  app.get("/api/onboarding/candidates/:id/steps", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const onboarding = await storage.getCandidateOnboarding(parseInt(id));
      
      if (!onboarding) {
        return res.status(404).json({ message: "Onboarding not found" });
      }
      
      const currentUser = await storage.getUser(req.user.id);
      // Vérifier l'accès : propriétaire ou admin/hr
      if (onboarding.userId !== req.user.id && 
          (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr'))) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const completions = await storage.getStepCompletionsByOnboarding(parseInt(id));
      res.json(completions);
    } catch (error) {
      console.error("Error fetching onboarding steps:", error);
      res.status(500).json({ message: "Failed to fetch onboarding steps" });
    }
  });

  app.put("/api/onboarding/steps/:completionId", requireAuth, async (req, res) => {
    try {
      const { completionId } = req.params;
      const updateData = { ...req.body, completedBy: req.user.id };
      
      if (req.body.status === 'completed') {
        updateData.completionDate = new Date();
      }
      
      const updatedCompletion = await storage.updateStepCompletion(parseInt(completionId), updateData);
      res.json(updatedCompletion);
    } catch (error) {
      console.error("Error updating step completion:", error);
      res.status(500).json({ message: "Failed to update step completion" });
    }
  });

  // ===== ROUTES FEEDBACK ET ACHIEVEMENTS =====
  
  app.post("/api/onboarding/feedback", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const feedbackData = {
        ...req.body,
        userId
      };
      const feedback = await storage.createOnboardingFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get("/api/onboarding/feedback", requireAuth, async (req: any, res) => {
    try {
      const { candidateOnboardingId } = req.query;
      const feedback = await storage.getOnboardingFeedback(candidateOnboardingId ? parseInt(candidateOnboardingId) : undefined);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get("/api/onboarding/achievements", requireAuth, async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/onboarding/user-achievements", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // ===== ROUTES INVITATIONS CANDIDATS =====
  
  app.get("/api/candidate-invitations", requireAuth, requireAdminRole, async (req, res) => {
    try {
      const invitations = await storage.getCandidateInvitations();
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching candidate invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.post("/api/candidate-invitations", requireAuth, requireAdminRole, async (req: any, res) => {
    try {
      const { randomUUID } = await import("crypto");
      
      const invitationData = {
        ...req.body,
        sentBy: req.user.id,
        invitationToken: randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      };
      
      const invitation = await storage.createCandidateInvitation(invitationData);
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating candidate invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  // Route publique pour accepter l'invitation candidat (via token)
  app.get("/api/candidate-invitation/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const invitation = await storage.getCandidateInvitationByToken(token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      if (new Date() > new Date(invitation.expiresAt)) {
        return res.status(410).json({ message: "Invitation expired" });
      }
      
      // Marquer l'invitation comme ouverte
      await storage.updateCandidateInvitation(invitation.id, {
        status: "opened"
      });
      
      res.json(invitation);
    } catch (error) {
      console.error("Error validating invitation:", error);
      res.status(500).json({ message: "Failed to validate invitation" });
    }
  });

  // ===== ROUTES ENTRETIENS =====
  
  app.get("/api/interviews", requireAuth, async (req, res) => {
    try {
      const interviews = await storage.getInterviews();
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews/evaluations", requireAuth, async (req, res) => {
    try {
      const evaluation = await storage.createInterviewEvaluation(req.body);
      res.status(201).json(evaluation);
    } catch (error) {
      console.error("Error creating interview evaluation:", error);
      res.status(500).json({ message: "Failed to create interview evaluation" });
    }
  });

  app.post("/api/interviews/feedback", requireAuth, async (req, res) => {
    try {
      const feedback = await storage.createInterviewFeedback(req.body);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating interview feedback:", error);
      res.status(500).json({ message: "Failed to create interview feedback" });
    }
  });

  // ===== ROUTES PERFORMANCE ET FORMATION =====
  
  app.get("/api/performance-reviews", requireAuth, async (req, res) => {
    try {
      const reviews = await storage.getPerformanceReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
      res.status(500).json({ message: "Failed to fetch performance reviews" });
    }
  });

  app.post("/api/performance-reviews", requireAuth, async (req: any, res) => {
    try {
      const reviewData = {
        ...req.body,
        reviewerId: req.user.id
      };
      const review = await storage.createPerformanceReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating performance review:", error);
      res.status(500).json({ message: "Failed to create performance review" });
    }
  });

  app.get("/api/training-programs", requireAuth, async (req, res) => {
    try {
      const programs = await storage.getTrainingPrograms();
      res.json(programs);
    } catch (error) {
      console.error("Error fetching training programs:", error);
      res.status(500).json({ message: "Failed to fetch training programs" });
    }
  });

  app.post("/api/training-programs", requireAuth, async (req: any, res) => {
    try {
      const programData = {
        ...req.body,
        createdBy: req.user.id
      };
      const program = await storage.createTrainingProgram(programData);
      res.status(201).json(program);
    } catch (error) {
      console.error("Error creating training program:", error);
      res.status(500).json({ message: "Failed to create training program" });
    }
  });

  app.get("/api/employee-training", requireAuth, async (req, res) => {
    try {
      const trainings = await storage.getEmployeeTraining();
      res.json(trainings);
    } catch (error) {
      console.error("Error fetching employee training:", error);
      res.status(500).json({ message: "Failed to fetch employee training" });
    }
  });

  app.post("/api/employee-training", requireAuth, async (req: any, res) => {
    try {
      const trainingData = {
        ...req.body,
        assignedBy: req.user.id
      };
      const training = await storage.createEmployeeTraining(trainingData);
      res.status(201).json(training);
    } catch (error) {
      console.error("Error creating employee training:", error);
      res.status(500).json({ message: "Failed to create employee training" });
    }
  });

  app.get("/api/time-entries", requireAuth, async (req, res) => {
    try {
      const entries = await storage.getTimeEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.post("/api/time-entries", requireAuth, async (req: any, res) => {
    try {
      const timeEntryData = {
        ...req.body,
        approvedBy: req.user.id
      };
      const timeEntry = await storage.createTimeEntry(timeEntryData);
      res.status(201).json(timeEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  // ===== ROUTES ANALYTICS ONBOARDING =====
  
  app.get("/api/onboarding/analytics", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const analytics = await storage.getOnboardingAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching onboarding analytics:", error);
      res.status(500).json({ message: "Failed to fetch onboarding analytics" });
    }
  });

  app.get("/api/onboarding/templates", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'hr')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const templates = await storage.getOnboardingProcessTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching process templates:", error);
      res.status(500).json({ message: "Failed to fetch process templates" });
    }
  });

  // ===== ROUTES ÉVÉNEMENTS =====
  
  app.post("/api/onboarding/events", requireAuth, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (adminUser?.role !== 'admin' && adminUser?.role !== 'hr') {
        return res.status(403).json({ message: "Access denied" });
      }

      const eventData = {
        ...req.body,
        createdBy: req.user.id
      };
      const event = await storage.createOnboardingEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/onboarding/events", requireAuth, async (req: any, res) => {
    try {
      const { candidateOnboardingId } = req.query;
      const events = await storage.getOnboardingEvents(candidateOnboardingId ? parseInt(candidateOnboardingId) : undefined);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Initialize default achievements on startup
  try {
    await storage.initializeDefaultAchievements();
  } catch (error) {
    console.log("Achievements initialization:", error);
  }

  const httpServer = createServer(app);
  return httpServer;
}