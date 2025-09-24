import {
  users,
  jobs,
  applications,
  employees,
  contracts,
  contractAmendments,
  payroll,
  leaveRequests,
  leaveBalances,
  hrRequests,
  onboardingProcesses,
  onboardingSteps,
  candidateOnboarding,
  onboardingStepCompletions,
  candidateInvitations,
  type User,
  type UpsertUser,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type UpdateApplication,
  type Employee,
  type InsertEmployee,
  type Contract,
  type InsertContract,
  type ContractAmendment,
  type InsertAmendment,
  type Payroll,
  type InsertPayroll,
  type LeaveRequest,
  type InsertLeaveRequest,
  type LeaveBalance,
  type HrRequest,
  type InsertHrRequest,
  type OnboardingProcess,
  type InsertOnboardingProcess,
  type OnboardingStep,
  type InsertOnboardingStep,
  type CandidateOnboarding,
  type InsertCandidateOnboarding,
  type OnboardingStepCompletion,
  type InsertStepCompletion,
  onboardingFeedback,
  type OnboardingFeedback,
  type InsertOnboardingFeedback,
  onboardingAchievements,
  type OnboardingAchievement,
  type InsertOnboardingAchievement,
  userAchievements,
  type UserAchievement,
  onboardingEvents,
  type OnboardingEvent,
  type InsertOnboardingEvent,
  type CandidateInvitation,
  type InsertCandidateInvitation,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, like, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth and email/password auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: Partial<User>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  
  // Job operations
  getAllJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  searchJobs(query: string, filters: any): Promise<Job[]>;
  
  // Application operations
  createApplication(application: InsertApplication, userId: string): Promise<Application>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  updateApplication(id: number, application: UpdateApplication): Promise<Application>;
  deleteApplication(id: number): Promise<boolean>;
  getApplicationsForJob(jobId: number): Promise<Application[]>;
  getApplicationsByRecruiter(recruiterId: string): Promise<Application[]>;
  
  // Recruitment operations
  getRecruiters(): Promise<User[]>;
  
  // Analytics operations
  getKPIs(): Promise<any>;
  getApplicationAnalytics(): Promise<any>;
  getJobAnalytics(): Promise<any>;
  
  // Enhanced search operations for applications with scoring
  searchApplicationsByScore(minAutoScore?: number, maxAutoScore?: number, minManualScore?: number, maxManualScore?: number): Promise<Application[]>;
  getApplicationsByDateRange(startDate: Date, endDate: Date): Promise<Application[]>;
  
  // Payroll operations
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  getPayroll(id: number): Promise<Payroll | undefined>;
  getPayrollsByEmployee(employeeId: number): Promise<Payroll[]>;
  getPayrollsByPeriod(period: string): Promise<Payroll[]>;
  updatePayroll(id: number, data: Partial<Payroll>): Promise<Payroll>;
  getAllPayrolls(): Promise<Payroll[]>;
  
  // Employee operations
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByUserId(userId: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  updateEmployee(id: number, data: Partial<Employee>): Promise<Employee>;
  
  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByEmployee(employeeId: number): Promise<Contract[]>;
  updateContract(id: number, data: Partial<Contract>): Promise<Contract>;
  getActiveContracts(): Promise<Contract[]>;
  
  // Leave operations
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  getLeaveRequest(id: number): Promise<LeaveRequest | undefined>;
  getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]>;
  updateLeaveRequest(id: number, data: Partial<LeaveRequest>): Promise<LeaveRequest>;
  getLeaveBalance(employeeId: number, year: number): Promise<LeaveBalance[]>;
  
  // HR Request operations
  createHrRequest(request: InsertHrRequest): Promise<HrRequest>;
  getHrRequest(id: number): Promise<HrRequest | undefined>;
  getHrRequestsByEmployee(employeeId: number): Promise<HrRequest[]>;
  getAllHrRequests(): Promise<HrRequest[]>;
  updateHrRequest(id: number, data: Partial<HrRequest>): Promise<HrRequest>;
  
  // Onboarding operations
  createOnboardingProcess(process: InsertOnboardingProcess): Promise<OnboardingProcess>;
  getOnboardingProcess(id: number): Promise<OnboardingProcess | undefined>;
  getAllOnboardingProcesses(): Promise<OnboardingProcess[]>;
  updateOnboardingProcess(id: number, data: Partial<OnboardingProcess>): Promise<OnboardingProcess>;
  
  createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep>;
  getOnboardingStepsByProcess(processId: number): Promise<OnboardingStep[]>;
  updateOnboardingStep(id: number, data: Partial<OnboardingStep>): Promise<OnboardingStep>;
  
  createCandidateOnboarding(onboarding: InsertCandidateOnboarding): Promise<CandidateOnboarding>;
  getCandidateOnboarding(id: number): Promise<CandidateOnboarding | undefined>;
  getCandidateOnboardingByUser(userId: string): Promise<CandidateOnboarding[]>;
  updateCandidateOnboarding(id: number, data: Partial<CandidateOnboarding>): Promise<CandidateOnboarding>;
  
  createStepCompletion(completion: InsertStepCompletion): Promise<OnboardingStepCompletion>;
  getStepCompletionsByOnboarding(onboardingId: number): Promise<OnboardingStepCompletion[]>;
  updateStepCompletion(id: number, data: Partial<OnboardingStepCompletion>): Promise<OnboardingStepCompletion>;
  
  // Employee ID generation
  generateEmployeeId(firstName: string, lastName: string): Promise<string>;
  
  // Onboarding analytics
  getOnboardingAnalytics(): Promise<any>;
  getOnboardingProcessTemplates(): Promise<OnboardingProcess[]>;
  
  // Feedback system
  createOnboardingFeedback(feedback: InsertOnboardingFeedback): Promise<OnboardingFeedback>;
  getOnboardingFeedback(candidateOnboardingId?: number): Promise<OnboardingFeedback[]>;
  
  // Achievement system
  createAchievement(achievement: InsertOnboardingAchievement): Promise<OnboardingAchievement>;
  getAchievements(): Promise<OnboardingAchievement[]>;
  awardAchievement(userId: string, achievementId: number, candidateOnboardingId?: number): Promise<UserAchievement>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  
  // Calendar events
  createOnboardingEvent(event: InsertOnboardingEvent): Promise<OnboardingEvent>;
  getOnboardingEvents(candidateOnboardingId?: number): Promise<OnboardingEvent[]>;
  updateOnboardingEvent(id: number, data: Partial<OnboardingEvent>): Promise<OnboardingEvent>;
  
  // Interview Management
  createInterview(interview: any): Promise<any>;
  getInterviews(): Promise<any[]>;
  updateInterview(id: number, data: any): Promise<any>;
  
  // Interview Evaluations
  createInterviewEvaluation(evaluation: any): Promise<any>;
  getInterviewEvaluations(interviewId: number): Promise<any[]>;
  
  // Interview Feedback
  createInterviewFeedback(feedback: any): Promise<any>;
  getInterviewFeedback(interviewId: number): Promise<any[]>;
  
  // Performance Management
  createPerformanceReview(review: any): Promise<any>;
  getPerformanceReviews(): Promise<any[]>;
  updatePerformanceReview(id: number, data: any): Promise<any>;
  
  // Training Management
  createTrainingProgram(program: any): Promise<any>;
  getTrainingPrograms(): Promise<any[]>;
  createEmployeeTraining(training: any): Promise<any>;
  getEmployeeTraining(): Promise<any[]>;
  
  // Disciplinary Actions
  createDisciplinaryAction(action: any): Promise<any>;
  getDisciplinaryActions(): Promise<any[]>;
  
  // Employee Documents
  createEmployeeDocument(document: any): Promise<any>;
  getEmployeeDocuments(): Promise<any[]>;
  
  // Time Tracking
  createTimeEntry(entry: any): Promise<any>;
  getTimeEntries(): Promise<any[]>;
  
  // Candidate Invitations
  createCandidateInvitation(invitation: InsertCandidateInvitation): Promise<CandidateInvitation>;
  getCandidateInvitations(): Promise<CandidateInvitation[]>;
  getCandidateInvitationByToken(token: string): Promise<CandidateInvitation | undefined>;
  updateCandidateInvitation(id: number, data: Partial<CandidateInvitation>): Promise<CandidateInvitation>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private nextJobId: number = 1;
  private nextApplicationId: number = 1;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.initializeMockJobs();
    this.initializeTestUsers();
  }

  private initializeMockJobs() {
    const mockJobs: Job[] = [
      {
        id: 1,
        title: "Développeur Full Stack React/Node.js",
        company: "TechCorp SARL",
        location: "Paris, France",
        description: "Rejoignez notre équipe pour développer des applications web modernes avec React et Node.js. Vous travaillerez sur des projets innovants dans un environnement agile...",
        requirements: "3-5 ans d'expérience en développement web, maîtrise de React.js, Node.js, TypeScript et PostgreSQL",
        salary: "45k - 60k €",
        contractType: "CDI",
        experienceLevel: "Intermédiaire",
        skills: ["React.js", "Node.js", "TypeScript", "PostgreSQL"],
        isActive: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        title: "UX/UI Designer Senior",
        company: "Design Studio Pro",
        location: "Lyon, France",
        description: "Nous recherchons un(e) UX/UI Designer passionné(e) pour concevoir des expériences utilisateur exceptionnelles. Vous interviendrez sur des projets variés...",
        requirements: "5+ ans d'expérience en design UX/UI, maîtrise de Figma, Adobe XD",
        salary: "50k - 65k €",
        contractType: "CDI",
        experienceLevel: "Senior",
        skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
        isActive: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        title: "Chef de Projet Digital",
        company: "Agence Digitale 360",
        location: "Toulouse, France",
        description: "Pilotez des projets web et mobile de A à Z. Vous coordonnerez les équipes techniques et créatives pour livrer des solutions digitales innovantes...",
        requirements: "2-4 ans d'expérience en gestion de projet digital",
        salary: "40k - 55k €",
        contractType: "CDD",
        experienceLevel: "Intermédiaire",
        skills: ["Agile/Scrum", "Jira", "Digital Strategy"],
        isActive: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 4,
        title: "Responsable Ressources Humaines",
        company: "AeroRecrutement SARL",
        location: "Dakar, Sénégal",
        description: "Nous recherchons un(e) Responsable RH expérimenté(e) pour gérer notre équipe grandissante. Vous serez en charge du recrutement, de la formation et de la gestion administrative du personnel.",
        requirements: "Master en RH ou équivalent, 3-5 ans d'expérience en management RH, maîtrise des outils SIRH",
        salary: "2 500 000 - 3 500 000 FCFA",
        contractType: "CDI",
        experienceLevel: "Intermédiaire",
        skills: ["Gestion RH", "Recrutement", "Formation", "Droit du travail"],
        isActive: 1,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 5,
        title: "Ingénieur DevOps",
        company: "CloudTech Solutions",
        location: "Casablanca, Maroc",
        description: "Rejoignez notre équipe pour automatiser et optimiser nos infrastructures cloud. Vous travaillerez avec AWS, Docker, Kubernetes dans un environnement DevOps moderne.",
        requirements: "3+ ans d'expérience DevOps, maîtrise AWS/Azure, Docker, Kubernetes, CI/CD",
        salary: "120k - 150k MAD",
        contractType: "CDI",
        experienceLevel: "Senior",
        skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
        isActive: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 6,
        title: "Comptable Senior",
        company: "Cabinet Expertise Comptable",
        location: "Abidjan, Côte d'Ivoire",
        description: "Poste de comptable senior pour la gestion complète de la comptabilité de PME. Vous serez responsable des clôtures mensuelles, de la fiscalité et du reporting.",
        requirements: "BTS/DUT Comptabilité + 3 ans d'expérience, maîtrise OHADA, logiciels comptables",
        salary: "1 200 000 - 1 800 000 FCFA",
        contractType: "CDI",
        experienceLevel: "Senior",
        skills: ["Comptabilité OHADA", "Fiscalité", "Sage", "Excel avancé"],
        isActive: 1,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 7,
        title: "Commercial Export",
        company: "Trading International SARL",
        location: "Tunis, Tunisie",
        description: "Développement commercial à l'international pour nos produits. Prospection, négociation et suivi clientèle sur les marchés africains et européens.",
        requirements: "BAC+3 Commerce International, 2-3 ans d'expérience export, anglais et français courants",
        salary: "2500 - 3500 TND + commissions",
        contractType: "CDI",
        experienceLevel: "Intermédiaire",
        skills: ["Vente", "Export", "Négociation", "Anglais", "Prospection"],
        isActive: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 8,
        title: "Assistant(e) de Direction",
        company: "Groupe Industriel Moderne",
        location: "Bamako, Mali",
        description: "Assistanat de direction polyvalent pour soutenir l'équipe dirigeante. Gestion administrative, planning, communication et coordination des projets.",
        requirements: "BAC+2 minimum, 1-2 ans d'expérience, maîtrise bureautique parfaite, discrétion",
        salary: "350 000 - 500 000 FCFA",
        contractType: "CDI",
        experienceLevel: "Junior",
        skills: ["Bureautique", "Organisation", "Communication", "Discrétion"],
        isActive: 1,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        id: 9,
        title: "Développeur Mobile Flutter",
        company: "Mobile Apps Africa",
        location: "Lagos, Nigeria",
        description: "Développement d'applications mobiles innovantes avec Flutter. Vous travaillerez sur des applications fintech et e-commerce pour le marché africain.",
        requirements: "2+ ans Flutter/Dart, expérience API REST, Firebase, publications App Store/Play Store",
        salary: "$18,000 - $25,000 USD",
        contractType: "CDI",
        experienceLevel: "Intermédiaire",
        skills: ["Flutter", "Dart", "Firebase", "API REST", "Mobile"],
        isActive: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 10,
        title: "Responsable Marketing Digital",
        company: "E-commerce Plus",
        location: "Rabat, Maroc",
        description: "Pilotage de la stratégie marketing digital. SEO/SEA, réseaux sociaux, email marketing, analytics pour booster les ventes en ligne.",
        requirements: "Master Marketing Digital, 3+ ans d'expérience, Google Ads, Facebook Ads, Analytics",
        salary: "15 000 - 20 000 MAD",
        contractType: "CDI",
        experienceLevel: "Senior",
        skills: ["SEO/SEA", "Google Ads", "Analytics", "Réseaux Sociaux", "E-commerce"],
        isActive: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ];

    mockJobs.forEach(job => {
      this.jobs.set(job.id, job);
      this.nextJobId = Math.max(this.nextJobId, job.id + 1);
    });
  }

  private initializeTestUsers() {
    const testUsers: User[] = [
      // Admin/Super Admin pour Mohamed avec mot de passe
      {
        id: "mohamed-admin-001",
        email: "mohamed.admin@aerorecrut.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZHcx8nUo7p2V3Nm", // password: admin123
        firstName: "Mohamed",
        lastName: "Administrateur",
        profileImageUrl: null,
        phone: "+33612345678",
        role: "admin",
        gender: "Homme",
        maritalStatus: "Marié(e)",
        address: "123 Avenue des Champs-Élysées, 75008 Paris",
        residencePlace: "Paris",
        idDocumentType: "CNI",
        idDocumentNumber: "123456789",
        birthDate: new Date("1980-01-15"),
        birthPlace: "Paris",
        birthCountry: "France",
        nationality: "Française",
        profileCompleted: true,
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Candidat de test avec mot de passe
      {
        id: "candidat-test-001",
        email: "candidat.test@example.com",
        password: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: candidate123
        firstName: "Jean",
        lastName: "Dupont",
        profileImageUrl: null,
        phone: "+33687654321",
        role: "candidate",
        gender: "Homme",
        maritalStatus: "Célibataire",
        address: "456 Rue de la République, 69000 Lyon",
        residencePlace: "Lyon",
        idDocumentType: "CNI",
        idDocumentNumber: "987654321",
        birthDate: new Date("1990-05-20"),
        birthPlace: "Lyon",
        birthCountry: "France",
        nationality: "Française",
        profileCompleted: true,
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // RH de test
      {
        id: "rh-test-001",
        email: "rh.test@aerorecrut.com",
        firstName: "Marie",
        lastName: "Martin",
        profileImageUrl: null,
        phone: "+33612987654",
        role: "hr",
        gender: "Femme",
        maritalStatus: "Marié(e)",
        address: "789 Boulevard Saint-Germain, 75006 Paris",
        residencePlace: "Paris",
        idDocumentType: "CNI",
        idDocumentNumber: "456789123",
        birthDate: new Date("1985-03-10"),
        birthPlace: "Paris",
        birthCountry: "France",
        nationality: "Française",
        profileCompleted: true,
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Recruteur de test
      {
        id: "recruteur-test-001",
        email: "recruteur.test@aerorecrut.com",
        firstName: "Pierre",
        lastName: "Durand",
        profileImageUrl: null,
        phone: "+33698765432",
        role: "recruiter",
        gender: "Homme",
        maritalStatus: "Célibataire",
        address: "321 Rue Victor Hugo, 31000 Toulouse",
        residencePlace: "Toulouse",
        idDocumentType: "CNI",
        idDocumentNumber: "789123456",
        birthDate: new Date("1988-07-25"),
        birthPlace: "Toulouse",
        birthCountry: "France",
        nationality: "Française",
        profileCompleted: true,
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Employé de test
      {
        id: "employe-test-001",
        email: "employe.test@aerorecrut.com",
        firstName: "Sophie",
        lastName: "Bernard",
        profileImageUrl: null,
        phone: "+33654321987",
        role: "employee",
        gender: "Femme",
        maritalStatus: "Union libre",
        address: "654 Avenue de la Libération, 13000 Marseille",
        residencePlace: "Marseille",
        idDocumentType: "CNI",
        idDocumentNumber: "321654987",
        birthDate: new Date("1992-12-08"),
        birthPlace: "Marseille",
        birthCountry: "France",
        nationality: "Française",
        profileCompleted: true,
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      phone: userData.phone || null,
      role: userData.role || "candidate",
      employeeId: userData.employeeId || null,
      gender: userData.gender || null,
      maritalStatus: userData.maritalStatus || null,
      address: userData.address || null,
      residencePlace: userData.residencePlace || null,
      idDocumentType: userData.idDocumentType || null,
      idDocumentNumber: userData.idDocumentNumber || null,
      birthDate: userData.birthDate || null,
      birthPlace: userData.birthPlace || null,
      birthCountry: userData.birthCountry || null,
      nationality: userData.nationality || null,
      profileCompleted: userData.profileCompleted || false,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }

    const user: User = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Job operations
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.isActive === 1);
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const job: Job = {
      id: this.nextJobId++,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
      contractType: jobData.contractType,
      requirements: jobData.requirements || null,
      salary: jobData.salary || null,
      experienceLevel: jobData.experienceLevel || null,
      skills: jobData.skills || null,
      isActive: jobData.isActive || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async updateJob(id: number, updateData: Partial<InsertJob>): Promise<Job | undefined> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) {
      return undefined;
    }

    const updatedJob: Job = {
      ...existingJob,
      ...updateData,
      updatedAt: new Date(),
    };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  async searchJobs(query: string, filters: any): Promise<Job[]> {
    const allJobs = await this.getAllJobs();
    
    return allJobs.filter(job => {
      // Text search
      const matchesQuery = !query || 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.location.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());

      // Contract type filter
      const matchesContract = !filters.contractType || 
        filters.contractType.length === 0 || 
        filters.contractType.includes(job.contractType);

      // Experience level filter
      const matchesExperience = !filters.experienceLevel || 
        filters.experienceLevel.length === 0 || 
        filters.experienceLevel.includes(job.experienceLevel);

      // Location filter
      const matchesLocation = !filters.location || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());

      return matchesQuery && matchesContract && matchesExperience && matchesLocation;
    });
  }

  // Application operations
  async createApplication(applicationData: InsertApplication, userId: string): Promise<Application> {
    const application: Application = {
      id: this.nextApplicationId++,
      userId,
      jobId: applicationData.jobId,
      phone: applicationData.phone || null,
      status: "pending",
      coverLetter: applicationData.coverLetter || null,
      cvPath: applicationData.cvPath || null,
      motivationLetterPath: applicationData.motivationLetterPath || null,
      availability: applicationData.availability || null,
      salaryExpectation: applicationData.salaryExpectation || null,
      assignedRecruiter: null,
      autoScore: 0,
      manualScore: null,
      scoreNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.set(application.id, application);
    return application;
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.userId === userId);
  }

  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async updateApplication(id: number, updateData: UpdateApplication): Promise<Application> {
    const existing = this.applications.get(id);
    if (!existing) {
      throw new Error("Application not found");
    }
    
    const updated: Application = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.applications.set(id, updated);
    return updated;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }

  async getApplicationsByRecruiter(recruiterId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.assignedRecruiter === recruiterId);
  }

  async getRecruiters(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      user.role === "recruiter" || user.role === "hr" || user.role === "admin"
    );
  }


  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async deleteUser(id: string): Promise<void> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error("User not found");
    }
    this.users.delete(id);
  }

  // Analytics operations
  async getKPIs(): Promise<any> {
    const allApplications = Array.from(this.applications.values());
    const allJobs = Array.from(this.jobs.values());
    const allUsers = Array.from(this.users.values());
    
    const candidates = allUsers.filter(u => u.role === 'candidate');
    const recruiters = allUsers.filter(u => u.role === 'recruiter' || u.role === 'hr');
    
    const statusCounts = {
      pending: allApplications.filter(a => a.status === 'pending').length,
      reviewed: allApplications.filter(a => a.status === 'reviewed').length,
      interview: allApplications.filter(a => a.status === 'interview').length,
      accepted: allApplications.filter(a => a.status === 'accepted').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
      assigned: allApplications.filter(a => a.status === 'assigned').length,
      scored: allApplications.filter(a => a.status === 'scored').length,
    };

    const conversionRate = allApplications.length > 0 
      ? ((statusCounts.accepted / allApplications.length) * 100).toFixed(1)
      : '0.0';

    const avgProcessingTime = this.calculateAvgProcessingTime(allApplications);
    
    return {
      totalApplications: allApplications.length,
      totalJobs: allJobs.filter(j => j.isActive === 1).length,
      totalCandidates: candidates.length,
      totalRecruiters: recruiters.length,
      statusCounts,
      conversionRate: parseFloat(conversionRate),
      avgProcessingTime,
      topPerformingJobs: this.getTopJobs(allApplications, allJobs)
    };
  }

  async getApplicationAnalytics(): Promise<any> {
    const allApplications = Array.from(this.applications.values());
    
    // Applications par mois (6 derniers mois)
    const monthlyData = this.getMonthlyApplications(allApplications);
    
    // Applications par statut pour graphique
    const statusData = [
      { name: 'En attente', value: allApplications.filter(a => a.status === 'pending').length },
      { name: 'Examinées', value: allApplications.filter(a => a.status === 'reviewed').length },
      { name: 'Entretiens', value: allApplications.filter(a => a.status === 'interview').length },
      { name: 'Acceptées', value: allApplications.filter(a => a.status === 'accepted').length },
      { name: 'Refusées', value: allApplications.filter(a => a.status === 'rejected').length },
      { name: 'Assignées', value: allApplications.filter(a => a.status === 'assigned').length },
      { name: 'Notées', value: allApplications.filter(a => a.status === 'scored').length },
    ].filter(item => item.value > 0);
    
    return {
      monthlyApplications: monthlyData,
      statusDistribution: statusData,
      scoreDistribution: this.getScoreDistribution(allApplications)
    };
  }

  async getJobAnalytics(): Promise<any> {
    const allJobs = Array.from(this.jobs.values());
    const allApplications = Array.from(this.applications.values());
    
    const jobPopularity = allJobs.map(job => ({
      name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
      applications: allApplications.filter(a => a.jobId === job.id).length,
      company: job.company
    })).sort((a, b) => b.applications - a.applications).slice(0, 10);
    
    const contractTypeData = [
      { name: 'CDI', value: allJobs.filter(j => j.contractType === 'CDI').length },
      { name: 'CDD', value: allJobs.filter(j => j.contractType === 'CDD').length },
      { name: 'Freelance', value: allJobs.filter(j => j.contractType === 'Freelance').length },
      { name: 'Stage', value: allJobs.filter(j => j.contractType === 'Stage').length },
    ].filter(item => item.value > 0);
    
    const experienceLevelData = [
      { name: 'Débutant', value: allJobs.filter(j => j.experienceLevel === 'Débutant').length },
      { name: 'Intermédiaire', value: allJobs.filter(j => j.experienceLevel === 'Intermédiaire').length },
      { name: 'Senior', value: allJobs.filter(j => j.experienceLevel === 'Senior').length },
    ].filter(item => item.value > 0);
    
    return {
      jobPopularity,
      contractTypes: contractTypeData,
      experienceLevels: experienceLevelData
    };
  }

  private calculateAvgProcessingTime(applications: Application[]): number {
    const processedApps = applications.filter(a => 
      a.status === 'accepted' || a.status === 'rejected'
    );
    
    if (processedApps.length === 0) return 0;
    
    const totalTime = processedApps.reduce((sum, app) => {
      const updatedAt = app.updatedAt || new Date();
      const createdAt = app.createdAt || new Date();
      const daysDiff = Math.ceil(
        (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + daysDiff;
    }, 0);
    
    return Math.round(totalTime / processedApps.length);
  }

  private getTopJobs(applications: Application[], jobs: Job[]): any[] {
    const jobAppCounts = new Map<number, number>();
    
    applications.forEach(app => {
      const current = jobAppCounts.get(app.jobId) || 0;
      jobAppCounts.set(app.jobId, current + 1);
    });
    
    return Array.from(jobAppCounts.entries())
      .map(([jobId, count]) => {
        const job = jobs.find(j => j.id === jobId);
        return job ? {
          title: job.title,
          company: job.company,
          applications: count
        } : null;
      })
      .filter(item => item !== null)
      .sort((a, b) => b!.applications - a!.applications)
      .slice(0, 5);
  }

  private getMonthlyApplications(applications: Application[]): any[] {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();
    
    // Initialiser les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      monthlyData[key] = 0;
    }
    
    // Compter les applications par mois
    applications.forEach(app => {
      const createdAt = app.createdAt || new Date();
      const date = new Date(createdAt);
      const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key]++;
      }
    });
    
    return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
  }

  private getScoreDistribution(applications: Application[]): any[] {
    const scoredApps = applications.filter(a => (a.autoScore || 0) > 0);
    
    if (scoredApps.length === 0) return [];
    
    const ranges = [
      { name: '0-20', min: 0, max: 20, count: 0 },
      { name: '21-40', min: 21, max: 40, count: 0 },
      { name: '41-60', min: 41, max: 60, count: 0 },
      { name: '61-80', min: 61, max: 80, count: 0 },
      { name: '81-100', min: 81, max: 100, count: 0 },
    ];
    
    scoredApps.forEach(app => {
      const score = app.autoScore || 0;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });
    
    return ranges.filter(r => r.count > 0);
  }

  // Employee operations
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee: Employee = {
      id: this.nextEmployeeId++,
      ...employee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employees.set(newEmployee.id, newEmployee);
    return newEmployee;
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(e => e.userId === userId);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    const existing = this.employees.get(id);
    if (!existing) {
      throw new Error("Employee not found");
    }
    const updated: Employee = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    return updated;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const newContract: Contract = {
      id: this.nextContractId++,
      ...contract,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contracts.set(newContract.id, newContract);
    return newContract;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByEmployee(employeeId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(c => c.employeeId === employeeId);
  }

  async updateContract(id: number, data: Partial<Contract>): Promise<Contract> {
    const existing = this.contracts.get(id);
    if (!existing) {
      throw new Error("Contract not found");
    }
    const updated: Contract = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.contracts.set(id, updated);
    return updated;
  }

  async getActiveContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(c => c.status === "active");
  }

  // Leave operations
  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const newRequest: LeaveRequest = {
      id: this.nextLeaveRequestId++,
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leaveRequests.set(newRequest.id, newRequest);
    return newRequest;
  }

  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    return this.leaveRequests.get(id);
  }

  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    return Array.from(this.leaveRequests.values()).filter(r => r.employeeId === employeeId);
  }

  async updateLeaveRequest(id: number, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const existing = this.leaveRequests.get(id);
    if (!existing) {
      throw new Error("Leave request not found");
    }
    const updated: LeaveRequest = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.leaveRequests.set(id, updated);
    return updated;
  }

  async getLeaveBalance(employeeId: number, year: number): Promise<LeaveBalance[]> {
    return Array.from(this.leaveBalances.values())
      .filter(b => b.employeeId === employeeId && b.year === year);
  }

  async updateLeaveBalance(employeeId: number, year: number, leaveType: string, usedDays: number): Promise<void> {
    const key = `${employeeId}-${year}-${leaveType}`;
    const existing = this.leaveBalances.get(key);
    
    if (existing) {
      const updated: LeaveBalance = {
        ...existing,
        usedDays: existing.usedDays + usedDays,
        remainingDays: existing.totalDays - (existing.usedDays + usedDays),
        updatedAt: new Date(),
      };
      this.leaveBalances.set(key, updated);
    } else {
      // Créer un nouveau solde avec des valeurs par défaut
      const defaultDays = this.getDefaultLeaveDays(leaveType);
      const newBalance: LeaveBalance = {
        id: Math.floor(Math.random() * 1000000),
        employeeId,
        year,
        leaveType,
        totalDays: defaultDays,
        usedDays,
        remainingDays: defaultDays - usedDays,
        carriedOverDays: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.leaveBalances.set(key, newBalance);
    }
  }

  private getDefaultLeaveDays(leaveType: string): number {
    const defaults: { [key: string]: number } = {
      vacation: 25,
      sick: 90,
      personal: 5,
      maternity: 112,
      paternity: 25
    };
    return defaults[leaveType] || 0;
  }

  // HR Request operations
  async createHrRequest(request: InsertHrRequest): Promise<HrRequest> {
    const newRequest: HrRequest = {
      id: this.nextHrRequestId++,
      ...request,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.hrRequests.set(newRequest.id, newRequest);
    return newRequest;
  }

  async getHrRequest(id: number): Promise<HrRequest | undefined> {
    return this.hrRequests.get(id);
  }

  async getHrRequestsByEmployee(employeeId: number): Promise<HrRequest[]> {
    return Array.from(this.hrRequests.values()).filter(r => r.employeeId === employeeId);
  }

  async getAllHrRequests(): Promise<HrRequest[]> {
    return Array.from(this.hrRequests.values());
  }

  async updateHrRequest(id: number, data: Partial<HrRequest>): Promise<HrRequest> {
    const existing = this.hrRequests.get(id);
    if (!existing) {
      throw new Error("HR request not found");
    }
    const updated: HrRequest = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.hrRequests.set(id, updated);
    return updated;
  }

  // Payroll operations (simplified implementation)
  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const newPayroll: Payroll = {
      id: this.nextPayrollId++,
      ...payroll,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payrolls.set(newPayroll.id, newPayroll);
    return newPayroll;
  }

  async getPayroll(id: number): Promise<Payroll | undefined> {
    return this.payrolls.get(id);
  }

  async getPayrollByEmployee(employeeId: number, period?: string): Promise<Payroll[]> {
    const payrolls = Array.from(this.payrolls.values())
      .filter(p => p.employeeId === employeeId);
    
    if (period) {
      return payrolls.filter(p => p.period === period);
    }
    return payrolls;
  }

  async updatePayroll(id: number, data: Partial<Payroll>): Promise<Payroll> {
    const existing = this.payrolls.get(id);
    if (!existing) {
      throw new Error("Payroll not found");
    }
    const updated: Payroll = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.payrolls.set(id, updated);
    return updated;
  }

  async getApplicationsForJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.jobId === jobId);
  }

  // Missing methods for authentication
  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const id = userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const user: User = {
      id,
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      phone: userData.phone || null,
      role: userData.role || "candidate",
      gender: userData.gender || null,
      maritalStatus: userData.maritalStatus || null,
      address: userData.address || null,
      residencePlace: userData.residencePlace || null,
      idDocumentType: userData.idDocumentType || null,
      idDocumentNumber: userData.idDocumentNumber || null,
      birthDate: userData.birthDate || null,
      birthPlace: userData.birthPlace || null,
      birthCountry: userData.birthCountry || null,
      nationality: userData.nationality || null,
      profileCompleted: userData.profileCompleted || false,
      employeeId: userData.employeeId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`);
    return user;
  }

  // Additional required methods for compatibility
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userToUpsert = {
      id: userData.id || `user-${Date.now()}`,
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      phone: userData.phone || null,
      role: userData.role || "candidate",
      employeeId: userData.employeeId || null,
      gender: userData.gender || null,
      maritalStatus: userData.maritalStatus || null,
      address: userData.address || null,
      residencePlace: userData.residencePlace || null,
      idDocumentType: userData.idDocumentType || null,
      idDocumentNumber: userData.idDocumentNumber || null,
      birthDate: userData.birthDate || null,
      birthPlace: userData.birthPlace || null,
      birthCountry: userData.birthCountry || null,
      nationality: userData.nationality || null,
      profileCompleted: userData.profileCompleted || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [user] = await db
      .insert(users)
      .values(userToUpsert)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userToUpsert.email,
          firstName: userToUpsert.firstName,
          lastName: userToUpsert.lastName,
          profileImageUrl: userToUpsert.profileImageUrl,
          phone: userToUpsert.phone,
          role: userToUpsert.role,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Nouvelle méthode pour créer un utilisateur
  async createUser(userData: Partial<User>): Promise<User> {
    const userToCreate = {
      id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      phone: userData.phone || null,
      role: userData.role || "candidate",
      employeeId: userData.employeeId || null,
      gender: userData.gender || null,
      maritalStatus: userData.maritalStatus || null,
      address: userData.address || null,
      residencePlace: userData.residencePlace || null,
      idDocumentType: userData.idDocumentType || null,
      idDocumentNumber: userData.idDocumentNumber || null,
      birthDate: userData.birthDate || null,
      birthPlace: userData.birthPlace || null,
      birthCountry: userData.birthCountry || null,
      nationality: userData.nationality || null,
      profileCompleted: userData.profileCompleted || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [user] = await db.insert(users).values(userToCreate).returning();
    return user;
  }

  // Nouvelle méthode pour trouver un utilisateur par email
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Job operations
  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.isActive, 1)).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: number, updateData: Partial<InsertJob>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob || undefined;
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchJobs(query: string, filters: any): Promise<Job[]> {
    let baseQuery = db.select().from(jobs).where(eq(jobs.isActive, 1));
    
    const conditions = [];
    
    if (query) {
      conditions.push(
        or(
          like(jobs.title, `%${query}%`),
          like(jobs.description, `%${query}%`),
          like(jobs.company, `%${query}%`)
        )
      );
    }
    
    if (filters.location) {
      conditions.push(like(jobs.location, `%${filters.location}%`));
    }
    
    if (filters.contractType && filters.contractType.length > 0) {
      const contractConditions = filters.contractType.map((type: string) => eq(jobs.contractType, type));
      conditions.push(or(...contractConditions));
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    return await baseQuery.orderBy(desc(jobs.createdAt));
  }

  // Application operations with enhanced scoring
  async createApplication(application: InsertApplication, userId: string): Promise<Application> {
    // Calculate auto-score based on application data
    const autoScore = await this.calculateAutoScore(application);
    
    const [newApp] = await db
      .insert(applications)
      .values({ ...application, userId, autoScore })
      .returning();
    return newApp;
  }

  private async calculateAutoScore(application: InsertApplication): Promise<number> {
    let score = 50; // Base score
    
    // Présence du CV (+20 points)
    if (application.cvPath) score += 20;
    
    // Qualité de la lettre de motivation (+15 points)
    if (application.coverLetter && application.coverLetter.length > 100) score += 15;
    
    // Copie diplôme (+15 points)
    if (application.diplomaPath) score += 15;
    
    return Math.min(score, 100);
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));
  }

  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(desc(applications.createdAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app || undefined;
  }

  async updateApplication(id: number, application: UpdateApplication): Promise<Application> {
    const [updated] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    if (!updated) throw new Error("Application not found");
    return updated;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getApplicationsForJob(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.createdAt));
  }

  async getApplicationsByRecruiter(recruiterId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.assignedRecruiter, recruiterId)).orderBy(desc(applications.createdAt));
  }

  // Enhanced search operations for applications with scoring
  async searchApplicationsByScore(
    minAutoScore?: number,
    maxAutoScore?: number,
    minManualScore?: number,
    maxManualScore?: number
  ): Promise<Application[]> {
    const conditions = [];
    
    if (minAutoScore !== undefined) {
      conditions.push(gte(applications.autoScore, minAutoScore));
    }
    if (maxAutoScore !== undefined) {
      conditions.push(lte(applications.autoScore, maxAutoScore));
    }
    if (minManualScore !== undefined) {
      conditions.push(gte(applications.manualScore, minManualScore));
    }
    if (maxManualScore !== undefined) {
      conditions.push(lte(applications.manualScore, maxManualScore));
    }
    
    let query = db.select().from(applications);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(applications.autoScore), desc(applications.manualScore));
  }

  async getApplicationsByDateRange(startDate: Date, endDate: Date): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(and(
        gte(applications.createdAt, startDate),
        lte(applications.createdAt, endDate)
      ))
      .orderBy(desc(applications.createdAt));
  }

  async getRecruiters(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.role, "recruiter"),
          eq(users.role, "hr"),
          eq(users.role, "admin")
        )
      );
  }

  // Payroll operations
  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const [newPayroll] = await db.insert(payroll).values(payrollData).returning();
    return newPayroll;
  }

  async getPayroll(id: number): Promise<Payroll | undefined> {
    const [payrollEntry] = await db.select().from(payroll).where(eq(payroll.id, id));
    return payrollEntry || undefined;
  }

  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return await db.select().from(payroll).where(eq(payroll.employeeId, employeeId)).orderBy(desc(payroll.period));
  }

  async getPayrollsByPeriod(period: string): Promise<Payroll[]> {
    return await db.select().from(payroll).where(eq(payroll.period, period)).orderBy(desc(payroll.createdAt));
  }

  async updatePayroll(id: number, data: Partial<Payroll>): Promise<Payroll> {
    const [updated] = await db
      .update(payroll)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payroll.id, id))
      .returning();
    if (!updated) throw new Error("Payroll not found");
    return updated;
  }

  async getAllPayrolls(): Promise<Payroll[]> {
    return await db.select().from(payroll).orderBy(desc(payroll.period), desc(payroll.createdAt));
  }

  // Employee operations - implement basic ones needed
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    const [updated] = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    if (!updated) throw new Error("Employee not found");
    return updated;
  }

  // Contract operations - implement basic ones needed
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract || undefined;
  }

  async getContractsByEmployee(employeeId: number): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.employeeId, employeeId)).orderBy(desc(contracts.createdAt));
  }

  async updateContract(id: number, data: Partial<Contract>): Promise<Contract> {
    const [updated] = await db
      .update(contracts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    if (!updated) throw new Error("Contract not found");
    return updated;
  }

  async getActiveContracts(): Promise<Contract[]> {
    return await db.select().from(contracts).where(eq(contracts.status, "active")).orderBy(desc(contracts.createdAt));
  }

  // Leave operations - implement basic ones needed
  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [newRequest] = await db.insert(leaveRequests).values(request).returning();
    return newRequest;
  }

  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    const [request] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return request || undefined;
  }

  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    return await db.select().from(leaveRequests).where(eq(leaveRequests.employeeId, employeeId)).orderBy(desc(leaveRequests.createdAt));
  }

  async updateLeaveRequest(id: number, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const [updated] = await db
      .update(leaveRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leaveRequests.id, id))
      .returning();
    if (!updated) throw new Error("Leave request not found");
    return updated;
  }

  async getLeaveBalance(employeeId: number, year: number): Promise<LeaveBalance[]> {
    return await db
      .select()
      .from(leaveBalances)
      .where(and(
        eq(leaveBalances.employeeId, employeeId),
        eq(leaveBalances.year, year)
      ));
  }

  // HR Request operations - implement basic ones needed
  async createHrRequest(request: InsertHrRequest): Promise<HrRequest> {
    const [newRequest] = await db.insert(hrRequests).values(request).returning();
    return newRequest;
  }

  async getHrRequest(id: number): Promise<HrRequest | undefined> {
    const [request] = await db.select().from(hrRequests).where(eq(hrRequests.id, id));
    return request || undefined;
  }

  async getHrRequestsByEmployee(employeeId: number): Promise<HrRequest[]> {
    return await db.select().from(hrRequests).where(eq(hrRequests.employeeId, employeeId)).orderBy(desc(hrRequests.createdAt));
  }

  async getAllHrRequests(): Promise<HrRequest[]> {
    return await db.select().from(hrRequests).orderBy(desc(hrRequests.createdAt));
  }

  async updateHrRequest(id: number, data: Partial<HrRequest>): Promise<HrRequest> {
    const [updated] = await db
      .update(hrRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(hrRequests.id, id))
      .returning();
    if (!updated) throw new Error("HR request not found");
    return updated;
  }

  // Analytics operations
  async getKPIs(): Promise<any> {
    const allApplications = await db.select().from(applications);
    const allJobs = await db.select().from(jobs).where(eq(jobs.isActive, 1));
    const allUsers = await db.select().from(users);
    
    const candidates = allUsers.filter(u => u.role === 'candidate');
    const recruiters = allUsers.filter(u => u.role === 'recruiter' || u.role === 'hr');
    
    const statusCounts = {
      pending: allApplications.filter(a => a.status === 'pending').length,
      reviewed: allApplications.filter(a => a.status === 'reviewed').length,
      interview: allApplications.filter(a => a.status === 'interview').length,
      accepted: allApplications.filter(a => a.status === 'accepted').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
      assigned: allApplications.filter(a => a.status === 'assigned').length,
      scored: allApplications.filter(a => a.status === 'scored').length,
    };

    const conversionRate = allApplications.length > 0 
      ? (statusCounts.accepted / allApplications.length) * 100
      : 0;

    return {
      totalApplications: allApplications.length,
      totalJobs: allJobs.length,
      totalCandidates: candidates.length,
      totalRecruiters: recruiters.length,
      statusCounts,
      conversionRate,
      avgProcessingTime: 5,
      topPerformingJobs: this.getTopJobsFromApplications(allApplications, allJobs)
    };
  }

  private getTopJobsFromApplications(applications: Application[], jobs: Job[]) {
    const jobApplicationCounts = new Map<number, number>();
    
    applications.forEach(app => {
      const count = jobApplicationCounts.get(app.jobId) || 0;
      jobApplicationCounts.set(app.jobId, count + 1);
    });
    
    return Array.from(jobApplicationCounts.entries())
      .map(([jobId, count]) => {
        const job = jobs.find(j => j.id === jobId);
        return job ? { 
          title: job.title, 
          company: job.company, 
          applications: count 
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.applications || 0) - (a?.applications || 0))
      .slice(0, 3);
  }

  async getApplicationAnalytics(): Promise<any> {
    const allApplications = await db.select().from(applications);
    
    const monthlyData = [
      { month: 'Jan', applications: allApplications.filter(a => a.createdAt && a.createdAt.getMonth() === 0).length },
      { month: 'Fév', applications: allApplications.filter(a => a.createdAt && a.createdAt.getMonth() === 1).length },
      { month: 'Mar', applications: allApplications.filter(a => a.createdAt && a.createdAt.getMonth() === 2).length },
    ];
    
    const statusData = [
      { name: 'En attente', value: allApplications.filter(a => a.status === 'pending').length },
      { name: 'Examinées', value: allApplications.filter(a => a.status === 'reviewed').length },
      { name: 'Entretiens', value: allApplications.filter(a => a.status === 'interview').length },
      { name: 'Acceptées', value: allApplications.filter(a => a.status === 'accepted').length },
      { name: 'Refusées', value: allApplications.filter(a => a.status === 'rejected').length },
    ].filter(item => item.value > 0);
    
    return {
      monthlyApplications: monthlyData,
      statusDistribution: statusData,
      scoreDistribution: this.getScoreDistribution(allApplications)
    };
  }

  private getScoreDistribution(applications: Application[]) {
    const distribution = {
      '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0
    };
    
    applications.forEach(app => {
      const score = app.autoScore || 0;
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });
    
    return Object.entries(distribution).map(([range, count]) => ({
      range, count
    }));
  }

  async getJobAnalytics(): Promise<any> {
    const allJobs = await db.select().from(jobs);
    const allApplications = await db.select().from(applications);
    
    const jobPopularity = allJobs.map(job => ({
      name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
      applications: allApplications.filter(a => a.jobId === job.id).length,
    })).sort((a, b) => b.applications - a.applications).slice(0, 5);
    
    return {
      jobPopularity,
    };
  }

  // Onboarding operations implementation
  async createOnboardingProcess(process: InsertOnboardingProcess): Promise<OnboardingProcess> {
    const [newProcess] = await db
      .insert(onboardingProcesses)
      .values(process)
      .returning();
    return newProcess;
  }

  async getOnboardingProcess(id: number): Promise<OnboardingProcess | undefined> {
    const [process] = await db.select().from(onboardingProcesses).where(eq(onboardingProcesses.id, id));
    return process || undefined;
  }

  async getAllOnboardingProcesses(): Promise<OnboardingProcess[]> {
    return await db.select().from(onboardingProcesses).where(eq(onboardingProcesses.isActive, true)).orderBy(desc(onboardingProcesses.createdAt));
  }

  async updateOnboardingProcess(id: number, data: Partial<OnboardingProcess>): Promise<OnboardingProcess> {
    const [updated] = await db
      .update(onboardingProcesses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardingProcesses.id, id))
      .returning();
    if (!updated) throw new Error("Onboarding process not found");
    return updated;
  }

  async createOnboardingStep(step: InsertOnboardingStep): Promise<OnboardingStep> {
    const [newStep] = await db
      .insert(onboardingSteps)
      .values(step)
      .returning();
    return newStep;
  }

  async getOnboardingStepsByProcess(processId: number): Promise<OnboardingStep[]> {
    return await db.select().from(onboardingSteps).where(eq(onboardingSteps.processId, processId)).orderBy(onboardingSteps.stepNumber);
  }

  async updateOnboardingStep(id: number, data: Partial<OnboardingStep>): Promise<OnboardingStep> {
    const [updated] = await db
      .update(onboardingSteps)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardingSteps.id, id))
      .returning();
    if (!updated) throw new Error("Onboarding step not found");
    return updated;
  }

  async createCandidateOnboarding(onboarding: InsertCandidateOnboarding): Promise<CandidateOnboarding> {
    const [newOnboarding] = await db
      .insert(candidateOnboarding)
      .values(onboarding)
      .returning();
    
    // Créer automatiquement les completions pour toutes les étapes du processus
    const steps = await this.getOnboardingStepsByProcess(onboarding.processId);
    for (const step of steps) {
      await db.insert(onboardingStepCompletions).values({
        candidateOnboardingId: newOnboarding.id,
        stepId: step.id,
        status: "pending"
      });
    }
    
    return newOnboarding;
  }

  async getCandidateOnboarding(id: number): Promise<CandidateOnboarding | undefined> {
    const [onboarding] = await db.select().from(candidateOnboarding).where(eq(candidateOnboarding.id, id));
    return onboarding || undefined;
  }

  async getCandidateOnboardingByUser(userId: string): Promise<CandidateOnboarding[]> {
    return await db.select().from(candidateOnboarding).where(eq(candidateOnboarding.userId, userId)).orderBy(desc(candidateOnboarding.createdAt));
  }

  async updateCandidateOnboarding(id: number, data: Partial<CandidateOnboarding>): Promise<CandidateOnboarding> {
    const [updated] = await db
      .update(candidateOnboarding)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(candidateOnboarding.id, id))
      .returning();
    if (!updated) throw new Error("Candidate onboarding not found");
    return updated;
  }

  async createStepCompletion(completion: InsertStepCompletion): Promise<OnboardingStepCompletion> {
    const [newCompletion] = await db
      .insert(onboardingStepCompletions)
      .values(completion)
      .returning();
    return newCompletion;
  }

  async getStepCompletionsByOnboarding(onboardingId: number): Promise<OnboardingStepCompletion[]> {
    return await db.select().from(onboardingStepCompletions).where(eq(onboardingStepCompletions.candidateOnboardingId, onboardingId)).orderBy(onboardingStepCompletions.id);
  }

  async updateStepCompletion(id: number, data: Partial<OnboardingStepCompletion>): Promise<OnboardingStepCompletion> {
    const [updated] = await db
      .update(onboardingStepCompletions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardingStepCompletions.id, id))
      .returning();
    if (!updated) throw new Error("Step completion not found");
    
    // Mettre à jour le progrès de l'onboarding
    await this.updateOnboardingProgress(data.candidateOnboardingId!);
    
    return updated;
  }

  async generateEmployeeId(firstName: string, lastName: string): Promise<string> {
    // Générer les initiales
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const baseId = `${firstInitial}${lastInitial}`;
    
    // Vérifier les IDs existants pour éviter les doublons
    const existingUsers = await db.select().from(users).where(like(users.employeeId, `${baseId}%`));
    
    if (existingUsers.length === 0) {
      return `${baseId}001`;
    }
    
    // Trouver le prochain numéro disponible
    const numbers = existingUsers
      .map(user => user.employeeId?.substring(2))
      .filter(num => num && /^\d{3}$/.test(num))
      .map(num => parseInt(num!, 10))
      .sort((a, b) => a - b);
    
    let nextNumber = 1;
    for (const num of numbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }
    
    return `${baseId}${nextNumber.toString().padStart(3, '0')}`;
  }

  private async updateOnboardingProgress(candidateOnboardingId: number): Promise<void> {
    // Calculer le pourcentage de progression
    const completions = await this.getStepCompletionsByOnboarding(candidateOnboardingId);
    const totalSteps = completions.length;
    const completedSteps = completions.filter(c => c.status === 'completed').length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    // Déterminer le statut global
    let status = 'pending';
    if (progress > 0 && progress < 100) status = 'in_progress';
    else if (progress === 100) status = 'completed';
    
    await this.updateCandidateOnboarding(candidateOnboardingId, {
      progress,
      status,
      actualCompletionDate: progress === 100 ? new Date().toISOString().split('T')[0] : undefined
    });
  }

  async getOnboardingAnalytics(): Promise<any> {
    const allOnboardings = await db.select().from(candidateOnboarding);
    const allProcesses = await db.select().from(onboardingProcesses);
    const allCompletions = await db.select().from(onboardingStepCompletions);
    
    // Calcul des métriques de base
    const totalOnboardings = allOnboardings.length;
    const completedOnboardings = allOnboardings.filter(o => o.status === 'completed').length;
    const inProgressOnboardings = allOnboardings.filter(o => o.status === 'in_progress').length;
    const pendingOnboardings = allOnboardings.filter(o => o.status === 'pending').length;
    
    // Taux de completion
    const completionRate = totalOnboardings > 0 ? Math.round((completedOnboardings / totalOnboardings) * 100) : 0;
    
    // Temps moyen de completion
    const completedWithDates = allOnboardings.filter(o => 
      o.status === 'completed' && o.startDate && o.actualCompletionDate
    );
    
    const averageCompletionTime = completedWithDates.length > 0 
      ? Math.round(completedWithDates.reduce((avg, o) => {
          const start = new Date(o.startDate);
          const end = new Date(o.actualCompletionDate!);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return avg + days;
        }, 0) / completedWithDates.length)
      : 0;
    
    // Distribution par département
    const departmentStats = allProcesses.reduce((acc, process) => {
      const processOnboardings = allOnboardings.filter(o => o.processId === process.id);
      if (!acc[process.department]) {
        acc[process.department] = { total: 0, completed: 0 };
      }
      acc[process.department].total += processOnboardings.length;
      acc[process.department].completed += processOnboardings.filter(o => o.status === 'completed').length;
      return acc;
    }, {} as any);
    
    // Évolution mensuelle
    const monthlyData = this.getMonthlyOnboardingData(allOnboardings);
    
    // Top étapes problématiques (qui prennent le plus de temps)
    const stepStats = await this.getStepAnalytics(allCompletions);
    
    return {
      overview: {
        totalOnboardings,
        completedOnboardings,
        inProgressOnboardings,
        pendingOnboardings,
        completionRate,
        averageCompletionTime
      },
      departmentStats: Object.entries(departmentStats).map(([department, stats]: [string, any]) => ({
        department,
        total: stats.total,
        completed: stats.completed,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      })),
      monthlyProgress: monthlyData,
      stepPerformance: stepStats
    };
  }

  private getMonthlyOnboardingData(onboardings: CandidateOnboarding[]) {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const started = onboardings.filter(o => {
        const startDate = new Date(o.startDate);
        return startDate >= monthStart && startDate <= monthEnd;
      }).length;
      
      const completed = onboardings.filter(o => {
        if (!o.actualCompletionDate) return false;
        const completionDate = new Date(o.actualCompletionDate);
        return completionDate >= monthStart && completionDate <= monthEnd;
      }).length;
      
      last6Months.push({
        month: monthName,
        started,
        completed
      });
    }
    
    return last6Months;
  }
  
  private async getStepAnalytics(completions: OnboardingStepCompletion[]) {
    const stepGroups = completions.reduce((acc, completion) => {
      if (!acc[completion.stepId]) {
        acc[completion.stepId] = {
          completions: [],
          totalTime: 0,
          count: 0
        };
      }
      
      if (completion.status === 'completed' && completion.completionDate) {
        acc[completion.stepId].completions.push(completion);
        acc[completion.stepId].count++;
      }
      
      return acc;
    }, {} as any);
    
    const stepAnalytics = [];
    for (const [stepId, data] of Object.entries(stepGroups) as [string, any][]) {
      const step = await db.select().from(onboardingSteps).where(eq(onboardingSteps.id, parseInt(stepId))).limit(1);
      if (step.length > 0) {
        const completionRate = (data.count / completions.filter(c => c.stepId === parseInt(stepId)).length) * 100;
        stepAnalytics.push({
          stepTitle: step[0].title,
          category: step[0].category,
          completionRate: Math.round(completionRate),
          totalCompletions: data.count
        });
      }
    }
    
    return stepAnalytics.sort((a, b) => a.completionRate - b.completionRate).slice(0, 5);
  }

  async getOnboardingProcessTemplates(): Promise<OnboardingProcess[]> {
    // Retourner les templates par défaut basés sur les départements courants
    const templates = [
      {
        id: 0,
        name: "Onboarding Personnel Aviation",
        description: "Processus complet pour l'intégration du personnel navigant et technique aéronautique",
        department: "Aviation",
        isActive: true,
        estimatedDuration: 21,
        createdAt: new Date().toISOString(),
        createdBy: "system",
        updatedAt: new Date().toISOString(),
        steps: [
          { title: "Accueil et présentation", category: "administrative", duration: 2 },
          { title: "Formation sécurité aéroportuaire", category: "formation", duration: 8 },
          { title: "Certification IATA", category: "technique", duration: 16 },
          { title: "Formation équipements", category: "technique", duration: 12 },
          { title: "Évaluation pratique", category: "formation", duration: 4 }
        ]
      },
      {
        id: 1,
        name: "Onboarding Sécurité Aéroport",
        description: "Formation spécialisée pour le personnel de sécurité aéroportuaire",
        department: "Sécurité",
        isActive: true,
        estimatedDuration: 14,
        createdAt: new Date().toISOString(),
        createdBy: "system",
        updatedAt: new Date().toISOString(),
        steps: [
          { title: "Procédures de sécurité", category: "formation", duration: 8 },
          { title: "Contrôle passagers", category: "technique", duration: 12 },
          { title: "Gestion des incidents", category: "formation", duration: 6 },
          { title: "Certification sécurité", category: "administrative", duration: 4 }
        ]
      },
      {
        id: 2,
        name: "Onboarding Administration",
        description: "Intégration pour les postes administratifs et de gestion",
        department: "Administration",
        isActive: true,
        estimatedDuration: 10,
        createdAt: new Date().toISOString(),
        createdBy: "system",
        updatedAt: new Date().toISOString(),
        steps: [
          { title: "Présentation de l'entreprise", category: "administrative", duration: 2 },
          { title: "Systèmes informatiques", category: "technique", duration: 4 },
          { title: "Procédures administratives", category: "formation", duration: 6 },
          { title: "Évaluation des compétences", category: "formation", duration: 2 }
        ]
      }
    ];
    
    return templates as OnboardingProcess[];
  }

  // Feedback system implementation
  async createOnboardingFeedback(feedback: InsertOnboardingFeedback): Promise<OnboardingFeedback> {
    const [newFeedback] = await db
      .insert(onboardingFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getOnboardingFeedback(candidateOnboardingId?: number): Promise<OnboardingFeedback[]> {
    if (candidateOnboardingId) {
      return await db
        .select()
        .from(onboardingFeedback)
        .where(eq(onboardingFeedback.candidateOnboardingId, candidateOnboardingId));
    }
    return await db.select().from(onboardingFeedback);
  }

  // Achievement system implementation
  async createAchievement(achievement: InsertOnboardingAchievement): Promise<OnboardingAchievement> {
    const [newAchievement] = await db
      .insert(onboardingAchievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getAchievements(): Promise<OnboardingAchievement[]> {
    return await db
      .select()
      .from(onboardingAchievements)
      .where(eq(onboardingAchievements.isActive, true));
  }

  async awardAchievement(userId: string, achievementId: number, candidateOnboardingId?: number): Promise<UserAchievement> {
    // Check if user already has this achievement
    const existing = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );

    if (existing.length > 0) {
      return existing[0];
    }

    const [award] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        candidateOnboardingId
      })
      .returning();
    return award;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        candidateOnboardingId: userAchievements.candidateOnboardingId,
        earnedAt: userAchievements.earnedAt,
        createdAt: userAchievements.createdAt,
        achievement: {
          id: onboardingAchievements.id,
          name: onboardingAchievements.name,
          description: onboardingAchievements.description,
          icon: onboardingAchievements.icon,
          category: onboardingAchievements.category,
          points: onboardingAchievements.points
        }
      })
      .from(userAchievements)
      .leftJoin(onboardingAchievements, eq(userAchievements.achievementId, onboardingAchievements.id))
      .where(eq(userAchievements.userId, userId));
  }

  // Calendar events implementation
  async createOnboardingEvent(event: InsertOnboardingEvent): Promise<OnboardingEvent> {
    const [newEvent] = await db
      .insert(onboardingEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getOnboardingEvents(candidateOnboardingId?: number): Promise<OnboardingEvent[]> {
    if (candidateOnboardingId) {
      return await db
        .select()
        .from(onboardingEvents)
        .where(eq(onboardingEvents.candidateOnboardingId, candidateOnboardingId))
        .orderBy(onboardingEvents.startDateTime);
    }
    return await db
      .select()
      .from(onboardingEvents)
      .orderBy(onboardingEvents.startDateTime);
  }

  async updateOnboardingEvent(id: number, data: Partial<OnboardingEvent>): Promise<OnboardingEvent> {
    const [updatedEvent] = await db
      .update(onboardingEvents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardingEvents.id, id))
      .returning();
    return updatedEvent;
  }

  // Initialize default achievements
  async initializeDefaultAchievements(): Promise<void> {
    const existingAchievements = await this.getAchievements();
    if (existingAchievements.length > 0) return;

    const defaultAchievements = [
      {
        name: "Premier Pas",
        description: "Terminé votre première étape d'onboarding",
        icon: "Star",
        category: "milestone",
        criteria: JSON.stringify({ stepCount: 1 }),
        points: 10
      },
      {
        name: "Rapide comme l'Éclair",
        description: "Terminé 3 étapes en une journée",
        icon: "Zap",
        category: "speed",
        criteria: JSON.stringify({ stepsPerDay: 3 }),
        points: 25
      },
      {
        name: "Professionnel Aviation",
        description: "Terminé toutes les formations aviation",
        icon: "Plane",
        category: "milestone",
        criteria: JSON.stringify({ categoryComplete: "formation" }),
        points: 50
      },
      {
        name: "Communicateur",
        description: "Échangé 10 messages avec votre mentor",
        icon: "MessageSquare",
        category: "engagement",
        criteria: JSON.stringify({ messageCount: 10 }),
        points: 20
      },
      {
        name: "Expert Sécurité",
        description: "Réussi toutes les certifications sécurité",
        icon: "Shield",
        category: "quality",
        criteria: JSON.stringify({ securityCertifications: true }),
        points: 40
      }
    ];

    for (const achievement of defaultAchievements) {
      await this.createAchievement(achievement);
    }
  }
  
  // Interview Management stubs (temporary implementations for interface compliance)
  async createInterview(interview: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...interview };
  }
  
  async getInterviews(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  async updateInterview(id: number, data: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id, ...data };
  }
  
  // Interview Evaluations stubs
  async createInterviewEvaluation(evaluation: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...evaluation };
  }
  
  async getInterviewEvaluations(interviewId: number): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  // Interview Feedback stubs
  async createInterviewFeedback(feedback: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...feedback };
  }
  
  async getInterviewFeedback(interviewId: number): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  // Performance Management stubs
  async createPerformanceReview(review: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...review };
  }
  
  async getPerformanceReviews(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  async updatePerformanceReview(id: number, data: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id, ...data };
  }
  
  // Training Management stubs
  async createTrainingProgram(program: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...program };
  }
  
  async getTrainingPrograms(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  async createEmployeeTraining(training: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...training };
  }
  
  async getEmployeeTraining(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  // Disciplinary Actions stubs
  async createDisciplinaryAction(action: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...action };
  }
  
  async getDisciplinaryActions(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  // Employee Documents stubs
  async createEmployeeDocument(document: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...document };
  }
  
  async getEmployeeDocuments(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  // Time Tracking stubs
  async createTimeEntry(entry: any): Promise<any> {
    // TODO: Implement with actual database tables
    return { id: 1, ...entry };
  }
  
  async getTimeEntries(): Promise<any[]> {
    // TODO: Implement with actual database tables
    return [];
  }
  
  // Candidate Invitations implementation
  async createCandidateInvitation(invitation: InsertCandidateInvitation): Promise<CandidateInvitation> {
    const [newInvitation] = await db
      .insert(candidateInvitations)
      .values(invitation)
      .returning();
    return newInvitation;
  }
  
  async getCandidateInvitations(): Promise<CandidateInvitation[]> {
    return await db
      .select()
      .from(candidateInvitations)
      .orderBy(desc(candidateInvitations.createdAt));
  }
  
  async getCandidateInvitationByToken(token: string): Promise<CandidateInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(candidateInvitations)
      .where(eq(candidateInvitations.invitationToken, token));
    return invitation || undefined;
  }
  
  async updateCandidateInvitation(id: number, data: Partial<CandidateInvitation>): Promise<CandidateInvitation> {
    const [updated] = await db
      .update(candidateInvitations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(candidateInvitations.id, id))
      .returning();
    return updated;
  }
}

// Use MemStorage for development when DATABASE_URL points to localhost
console.log("🗄️ Using in-memory storage for development");
export const storage = new MemStorage();
