import { db } from "./db";
import { 
  users, 
  jobs, 
  applications, 
  employees,
  contracts,
  payroll,
  leaveRequests,
  hrRequests,
  onboardingProcesses,
  onboardingSteps,
  candidateOnboarding,
  onboardingStepCompletions,
  onboardingFeedback,
  onboardingAchievements,
  userAchievements,
  onboardingEvents,
  interviews,
  interviewEvaluations,
  interviewFeedback,
  performanceReviews,
  trainingPrograms,
  employeeTraining,
  timeEntries,
  candidateInvitations
} from "@shared/schema";
import type { 
  User, 
  UpsertUser, 
  Job, 
  InsertJob, 
  Application, 
  InsertApplication,
  UpdateApplication,
  Employee,
  InsertEmployee,
  Contract,
  InsertContract,
  Payroll,
  InsertPayroll,
  LeaveRequest,
  InsertLeaveRequest,
  HrRequest,
  InsertHrRequest,
  OnboardingProcess,
  InsertOnboardingProcess,
  OnboardingStep,
  InsertOnboardingStep,
  CandidateOnboarding,
  InsertCandidateOnboarding,
  OnboardingStepCompletion,
  InsertStepCompletion,
  OnboardingFeedback,
  InsertOnboardingFeedback,
  OnboardingAchievement,
  InsertOnboardingAchievement,
  UserAchievement,
  InsertUserAchievement,
  OnboardingEvent,
  InsertOnboardingEvent,
  Interview,
  InsertInterview,
  InterviewEvaluation,
  InsertInterviewEvaluation,
  InterviewFeedback,
  InsertInterviewFeedback,
  PerformanceReview,
  InsertPerformanceReview,
  TrainingProgram,
  InsertTrainingProgram,
  EmployeeTraining,
  InsertEmployeeTraining,
  TimeEntry,
  InsertTimeEntry,
  CandidateInvitation,
  InsertCandidateInvitation
} from "@shared/schema";
import { eq, desc, and, gte, lte, ilike, or, sql, count, avg } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(userData: Partial<UpsertUser>): Promise<User>;
  updateUser(id: string, userData: Partial<UpsertUser>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  upsertUser(userData: UpsertUser): Promise<User>;
  
  // Job management
  getAllJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | null>;
  createJob(jobData: InsertJob): Promise<Job>;
  updateJob(id: number, jobData: Partial<InsertJob>): Promise<Job | null>;
  deleteJob(id: number): Promise<boolean>;
  searchJobs(query: string, filters: any): Promise<Job[]>;
  
  // Application management
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getAllApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | null>;
  createApplication(applicationData: InsertApplication, userId: string): Promise<Application>;
  updateApplication(id: number, applicationData: Partial<UpdateApplication>): Promise<Application | null>;
  deleteApplication(id: number): Promise<boolean>;
  getApplicationsForJob(jobId: number): Promise<Application[]>;
  getApplicationsByRecruiter(recruiterId: string): Promise<Application[]>;
  searchApplicationsByScore(minAutoScore?: number, maxAutoScore?: number, minManualScore?: number, maxManualScore?: number): Promise<Application[]>;
  getApplicationsByDateRange(startDate: Date, endDate: Date): Promise<Application[]>;
  
  // Employee management
  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | null>;
  getEmployeeByUserId(userId: string): Promise<Employee | null>;
  createEmployee(employeeData: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employeeData: Partial<InsertEmployee>): Promise<Employee>;
  generateEmployeeId(firstName: string, lastName: string): Promise<string>;
  
  // Contract management
  getActiveContracts(): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | null>;
  createContract(contractData: InsertContract): Promise<Contract>;
  updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract>;
  
  // Payroll management
  getAllPayrolls(): Promise<Payroll[]>;
  getPayroll(id: number): Promise<Payroll | null>;
  createPayroll(payrollData: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payrollData: Partial<InsertPayroll>): Promise<Payroll>;
  getPayrollByEmployee(employeeId: number, period: string): Promise<Payroll[]>;
  getPayrollsByEmployee(employeeId: number): Promise<Payroll[]>;
  
  // Leave management
  getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]>;
  getLeaveRequest(id: number): Promise<LeaveRequest | null>;
  createLeaveRequest(leaveData: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(id: number, leaveData: Partial<InsertLeaveRequest>): Promise<LeaveRequest>;
  getLeaveBalance(employeeId: number, year: number): Promise<any[]>;
  updateLeaveBalance(employeeId: number, year: number, leaveType: string, daysUsed: number): Promise<void>;
  
  // HR requests
  getAllHrRequests(): Promise<HrRequest[]>;
  getHrRequest(id: number): Promise<HrRequest | null>;
  createHrRequest(requestData: InsertHrRequest): Promise<HrRequest>;
  updateHrRequest(id: number, requestData: Partial<InsertHrRequest>): Promise<HrRequest>;
  
  // Analytics and KPIs
  getKPIs(): Promise<any>;
  getApplicationAnalytics(): Promise<any>;
  getJobAnalytics(): Promise<any>;
  getRecruiters(): Promise<User[]>;
  
  // Onboarding management
  getAllOnboardingProcesses(): Promise<OnboardingProcess[]>;
  getOnboardingProcess(id: number): Promise<OnboardingProcess | null>;
  createOnboardingProcess(processData: InsertOnboardingProcess): Promise<OnboardingProcess>;
  updateOnboardingProcess(id: number, processData: Partial<InsertOnboardingProcess>): Promise<OnboardingProcess>;
  getOnboardingStepsByProcess(processId: number): Promise<OnboardingStep[]>;
  createOnboardingStep(stepData: InsertOnboardingStep): Promise<OnboardingStep>;
  getCandidateOnboardingByUser(userId: string): Promise<CandidateOnboarding[]>;
  getCandidateOnboarding(id: number): Promise<CandidateOnboarding | null>;
  createCandidateOnboarding(onboardingData: InsertCandidateOnboarding): Promise<CandidateOnboarding>;
  getStepCompletionsByOnboarding(onboardingId: number): Promise<OnboardingStepCompletion[]>;
  updateStepCompletion(id: number, completionData: Partial<InsertStepCompletion>): Promise<OnboardingStepCompletion>;
  getOnboardingAnalytics(): Promise<any>;
  getOnboardingProcessTemplates(): Promise<any[]>;
  
  // Feedback and achievements
  createOnboardingFeedback(feedbackData: InsertOnboardingFeedback): Promise<OnboardingFeedback>;
  getOnboardingFeedback(candidateOnboardingId?: number): Promise<OnboardingFeedback[]>;
  getAchievements(): Promise<OnboardingAchievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: number, candidateOnboardingId?: number): Promise<UserAchievement>;
  initializeDefaultAchievements(): Promise<void>;
  
  // Calendar events
  createOnboardingEvent(eventData: InsertOnboardingEvent): Promise<OnboardingEvent>;
  getOnboardingEvents(candidateOnboardingId?: number): Promise<OnboardingEvent[]>;
  updateOnboardingEvent(id: number, eventData: Partial<InsertOnboardingEvent>): Promise<OnboardingEvent>;
  
  // Interview management
  getInterviews(): Promise<Interview[]>;
  createInterview(interviewData: InsertInterview): Promise<Interview>;
  createInterviewEvaluation(evaluationData: InsertInterviewEvaluation): Promise<InterviewEvaluation>;
  createInterviewFeedback(feedbackData: InsertInterviewFeedback): Promise<InterviewFeedback>;
  
  // Performance and training
  getPerformanceReviews(): Promise<PerformanceReview[]>;
  createPerformanceReview(reviewData: InsertPerformanceReview): Promise<PerformanceReview>;
  getTrainingPrograms(): Promise<TrainingProgram[]>;
  createTrainingProgram(programData: InsertTrainingProgram): Promise<TrainingProgram>;
  getEmployeeTraining(): Promise<EmployeeTraining[]>;
  createEmployeeTraining(trainingData: InsertEmployeeTraining): Promise<EmployeeTraining>;
  getTimeEntries(): Promise<TimeEntry[]>;
  createTimeEntry(timeData: InsertTimeEntry): Promise<TimeEntry>;
  
  // Candidate invitations
  getCandidateInvitations(): Promise<CandidateInvitation[]>;
  getCandidateInvitationByToken(token: string): Promise<CandidateInvitation | null>;
  createCandidateInvitation(invitationData: InsertCandidateInvitation): Promise<CandidateInvitation>;
  updateCandidateInvitation(id: number, data: Partial<InsertCandidateInvitation>): Promise<CandidateInvitation>;
}

class DatabaseStorage implements IStorage {
  // ===== USER MANAGEMENT =====
  
  async getUser(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async createUser(userData: Partial<UpsertUser>): Promise<User> {
    try {
      const result = await db.insert(users).values({
        id: userData.id || sql`gen_random_uuid()`,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || "candidate",
        profileCompleted: userData.profileCompleted || false,
        gender: userData.gender,
        maritalStatus: userData.maritalStatus,
        address: userData.address,
        residencePlace: userData.residencePlace,
        idDocumentType: userData.idDocumentType,
        idDocumentNumber: userData.idDocumentNumber,
        birthDate: userData.birthDate,
        birthPlace: userData.birthPlace,
        birthCountry: userData.birthCountry,
        nationality: userData.nationality,
        employeeId: userData.employeeId,
        profileImageUrl: userData.profileImageUrl,
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    try {
      const result = await db.update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("User not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error getting users by role:", error);
      return [];
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const existingUser = await this.getUser(userData.id);
      
      if (existingUser) {
        return await this.updateUser(userData.id, userData);
      } else {
        return await this.createUser(userData);
      }
    } catch (error) {
      console.error("Error upserting user:", error);
      throw new Error("Failed to upsert user");
    }
  }

  // ===== JOB MANAGEMENT =====
  
  async getAllJobs(): Promise<Job[]> {
    try {
      return await db.select().from(jobs).where(eq(jobs.isActive, 1)).orderBy(desc(jobs.createdAt));
    } catch (error) {
      console.error("Error getting all jobs:", error);
      return [];
    }
  }

  async getJob(id: number): Promise<Job | null> {
    try {
      const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting job:", error);
      return null;
    }
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    try {
      const result = await db.insert(jobs).values(jobData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating job:", error);
      throw new Error("Failed to create job");
    }
  }

  async updateJob(id: number, jobData: Partial<InsertJob>): Promise<Job | null> {
    try {
      const result = await db.update(jobs)
        .set({
          ...jobData,
          updatedAt: new Date()
        })
        .where(eq(jobs.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error("Error updating job:", error);
      return null;
    }
  }

  async deleteJob(id: number): Promise<boolean> {
    try {
      const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting job:", error);
      return false;
    }
  }

  async searchJobs(query: string, filters: any): Promise<Job[]> {
    try {
      let queryBuilder = db.select().from(jobs).where(eq(jobs.isActive, 1));
      
      if (query) {
        queryBuilder = queryBuilder.where(
          or(
            ilike(jobs.title, `%${query}%`),
            ilike(jobs.company, `%${query}%`),
            ilike(jobs.description, `%${query}%`)
          )
        );
      }
      
      if (filters.contractType && filters.contractType.length > 0) {
        queryBuilder = queryBuilder.where(
          sql`${jobs.contractType} = ANY(${filters.contractType})`
        );
      }
      
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        queryBuilder = queryBuilder.where(
          sql`${jobs.experienceLevel} = ANY(${filters.experienceLevel})`
        );
      }
      
      if (filters.location) {
        queryBuilder = queryBuilder.where(ilike(jobs.location, `%${filters.location}%`));
      }
      
      return await queryBuilder.orderBy(desc(jobs.createdAt));
    } catch (error) {
      console.error("Error searching jobs:", error);
      return [];
    }
  }

  // ===== APPLICATION MANAGEMENT =====
  
  async getApplicationsByUser(userId: string): Promise<Application[]> {
    try {
      const result = await db.select({
        id: applications.id,
        userId: applications.userId,
        jobId: applications.jobId,
        status: applications.status,
        coverLetter: applications.coverLetter,
        cvPath: applications.cvPath,
        motivationLetterPath: applications.motivationLetterPath,
        diplomaPath: applications.diplomaPath,
        availability: applications.availability,
        salaryExpectation: applications.salaryExpectation,
        phone: applications.phone,
        assignedRecruiter: applications.assignedRecruiter,
        autoScore: applications.autoScore,
        manualScore: applications.manualScore,
        scoreNotes: applications.scoreNotes,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          contractType: jobs.contractType,
          salary: jobs.salary
        }
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting applications by user:", error);
      return [];
    }
  }

  async getAllApplications(): Promise<Application[]> {
    try {
      const result = await db.select({
        id: applications.id,
        userId: applications.userId,
        jobId: applications.jobId,
        status: applications.status,
        coverLetter: applications.coverLetter,
        cvPath: applications.cvPath,
        motivationLetterPath: applications.motivationLetterPath,
        diplomaPath: applications.diplomaPath,
        availability: applications.availability,
        salaryExpectation: applications.salaryExpectation,
        phone: applications.phone,
        assignedRecruiter: applications.assignedRecruiter,
        autoScore: applications.autoScore,
        manualScore: applications.manualScore,
        scoreNotes: applications.scoreNotes,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        candidate: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone
        },
        job: {
          id: jobs.id,
          title: jobs.title,
          company: jobs.company,
          location: jobs.location,
          contractType: jobs.contractType
        }
      })
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .orderBy(desc(applications.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting all applications:", error);
      return [];
    }
  }

  async getApplication(id: number): Promise<Application | null> {
    try {
      const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting application:", error);
      return null;
    }
  }

  async createApplication(applicationData: InsertApplication, userId: string): Promise<Application> {
    try {
      const result = await db.insert(applications).values({
        ...applicationData,
        userId,
        status: "pending"
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error("Error creating application:", error);
      throw new Error("Failed to create application");
    }
  }

  async updateApplication(id: number, applicationData: Partial<UpdateApplication>): Promise<Application | null> {
    try {
      const result = await db.update(applications)
        .set({
          ...applicationData,
          updatedAt: new Date()
        })
        .where(eq(applications.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error("Error updating application:", error);
      return null;
    }
  }

  async deleteApplication(id: number): Promise<boolean> {
    try {
      const result = await db.delete(applications).where(eq(applications.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting application:", error);
      return false;
    }
  }

  async getApplicationsForJob(jobId: number): Promise<Application[]> {
    try {
      return await db.select().from(applications).where(eq(applications.jobId, jobId));
    } catch (error) {
      console.error("Error getting applications for job:", error);
      return [];
    }
  }

  async getApplicationsByRecruiter(recruiterId: string): Promise<Application[]> {
    try {
      return await db.select().from(applications).where(eq(applications.assignedRecruiter, recruiterId));
    } catch (error) {
      console.error("Error getting applications by recruiter:", error);
      return [];
    }
  }

  async searchApplicationsByScore(minAutoScore?: number, maxAutoScore?: number, minManualScore?: number, maxManualScore?: number): Promise<Application[]> {
    try {
      let queryBuilder = db.select().from(applications);
      
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
      
      if (conditions.length > 0) {
        queryBuilder = queryBuilder.where(and(...conditions));
      }
      
      return await queryBuilder.orderBy(desc(applications.createdAt));
    } catch (error) {
      console.error("Error searching applications by score:", error);
      return [];
    }
  }

  async getApplicationsByDateRange(startDate: Date, endDate: Date): Promise<Application[]> {
    try {
      return await db.select().from(applications)
        .where(and(
          gte(applications.createdAt, startDate),
          lte(applications.createdAt, endDate)
        ))
        .orderBy(desc(applications.createdAt));
    } catch (error) {
      console.error("Error getting applications by date range:", error);
      return [];
    }
  }

  // ===== EMPLOYEE MANAGEMENT =====
  
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const result = await db.select({
        id: employees.id,
        userId: employees.userId,
        employeeNumber: employees.employeeNumber,
        department: employees.department,
        position: employees.position,
        manager: employees.manager,
        startDate: employees.startDate,
        endDate: employees.endDate,
        status: employees.status,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone
        }
      })
      .from(employees)
      .leftJoin(users, eq(employees.userId, users.id))
      .orderBy(desc(employees.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting all employees:", error);
      return [];
    }
  }

  async getEmployee(id: number): Promise<Employee | null> {
    try {
      const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting employee:", error);
      return null;
    }
  }

  async getEmployeeByUserId(userId: string): Promise<Employee | null> {
    try {
      const result = await db.select().from(employees).where(eq(employees.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting employee by user ID:", error);
      return null;
    }
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    try {
      const result = await db.insert(employees).values(employeeData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating employee:", error);
      throw new Error("Failed to create employee");
    }
  }

  async updateEmployee(id: number, employeeData: Partial<InsertEmployee>): Promise<Employee> {
    try {
      const result = await db.update(employees)
        .set({
          ...employeeData,
          updatedAt: new Date()
        })
        .where(eq(employees.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Employee not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating employee:", error);
      throw new Error("Failed to update employee");
    }
  }

  async generateEmployeeId(firstName: string, lastName: string): Promise<string> {
    try {
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const employeeId = `${initials}${timestamp}`;
      
      // Vérifier l'unicité
      const existing = await db.select().from(users).where(eq(users.employeeId, employeeId)).limit(1);
      if (existing.length > 0) {
        // Si collision, ajouter un suffixe aléatoire
        const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${employeeId}${randomSuffix}`;
      }
      
      return employeeId;
    } catch (error) {
      console.error("Error generating employee ID:", error);
      throw new Error("Failed to generate employee ID");
    }
  }

  // ===== CONTRACT MANAGEMENT =====
  
  async getActiveContracts(): Promise<Contract[]> {
    try {
      return await db.select().from(contracts).where(eq(contracts.status, "active"));
    } catch (error) {
      console.error("Error getting active contracts:", error);
      return [];
    }
  }

  async getContract(id: number): Promise<Contract | null> {
    try {
      const result = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting contract:", error);
      return null;
    }
  }

  async createContract(contractData: InsertContract): Promise<Contract> {
    try {
      const result = await db.insert(contracts).values(contractData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating contract:", error);
      throw new Error("Failed to create contract");
    }
  }

  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract> {
    try {
      const result = await db.update(contracts)
        .set({
          ...contractData,
          updatedAt: new Date()
        })
        .where(eq(contracts.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Contract not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating contract:", error);
      throw new Error("Failed to update contract");
    }
  }

  // ===== PAYROLL MANAGEMENT =====
  
  async getAllPayrolls(): Promise<Payroll[]> {
    try {
      const result = await db.select({
        id: payroll.id,
        employeeId: payroll.employeeId,
        period: payroll.period,
        baseSalary: payroll.baseSalary,
        bonuses: payroll.bonuses,
        overtime: payroll.overtime,
        deductions: payroll.deductions,
        socialCharges: payroll.socialCharges,
        taxes: payroll.taxes,
        netSalary: payroll.netSalary,
        workingDays: payroll.workingDays,
        absenceDays: payroll.absenceDays,
        status: payroll.status,
        paymentDate: payroll.paymentDate,
        payslipPath: payroll.payslipPath,
        notes: payroll.notes,
        createdBy: payroll.createdBy,
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt,
        employee: {
          id: employees.id,
          employeeNumber: employees.employeeNumber,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      })
      .from(payroll)
      .leftJoin(employees, eq(payroll.employeeId, employees.id))
      .leftJoin(users, eq(employees.userId, users.id))
      .orderBy(desc(payroll.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting all payrolls:", error);
      return [];
    }
  }

  async getPayroll(id: number): Promise<Payroll | null> {
    try {
      const result = await db.select().from(payroll).where(eq(payroll.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting payroll:", error);
      return null;
    }
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    try {
      const result = await db.insert(payroll).values(payrollData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating payroll:", error);
      throw new Error("Failed to create payroll");
    }
  }

  async updatePayroll(id: number, payrollData: Partial<InsertPayroll>): Promise<Payroll> {
    try {
      const result = await db.update(payroll)
        .set({
          ...payrollData,
          updatedAt: new Date()
        })
        .where(eq(payroll.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Payroll not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating payroll:", error);
      throw new Error("Failed to update payroll");
    }
  }

  async getPayrollByEmployee(employeeId: number, period: string): Promise<Payroll[]> {
    try {
      return await db.select().from(payroll)
        .where(and(
          eq(payroll.employeeId, employeeId),
          eq(payroll.period, period)
        ));
    } catch (error) {
      console.error("Error getting payroll by employee:", error);
      return [];
    }
  }

  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    try {
      return await db.select().from(payroll)
        .where(eq(payroll.employeeId, employeeId))
        .orderBy(desc(payroll.createdAt));
    } catch (error) {
      console.error("Error getting payrolls by employee:", error);
      return [];
    }
  }

  // ===== LEAVE MANAGEMENT =====
  
  async getLeaveRequestsByEmployee(employeeId: number): Promise<LeaveRequest[]> {
    try {
      return await db.select().from(leaveRequests)
        .where(eq(leaveRequests.employeeId, employeeId))
        .orderBy(desc(leaveRequests.createdAt));
    } catch (error) {
      console.error("Error getting leave requests by employee:", error);
      return [];
    }
  }

  async getLeaveRequest(id: number): Promise<LeaveRequest | null> {
    try {
      const result = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting leave request:", error);
      return null;
    }
  }

  async createLeaveRequest(leaveData: InsertLeaveRequest): Promise<LeaveRequest> {
    try {
      const result = await db.insert(leaveRequests).values(leaveData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating leave request:", error);
      throw new Error("Failed to create leave request");
    }
  }

  async updateLeaveRequest(id: number, leaveData: Partial<InsertLeaveRequest>): Promise<LeaveRequest> {
    try {
      const result = await db.update(leaveRequests)
        .set({
          ...leaveData,
          updatedAt: new Date()
        })
        .where(eq(leaveRequests.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Leave request not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating leave request:", error);
      throw new Error("Failed to update leave request");
    }
  }

  async getLeaveBalance(employeeId: number, year: number): Promise<any[]> {
    try {
      // Mock implementation - should be implemented with actual leave balance table
      return [
        { leaveType: "vacation", totalDays: 25, usedDays: 5, remainingDays: 20 },
        { leaveType: "sick", totalDays: 10, usedDays: 2, remainingDays: 8 },
        { leaveType: "personal", totalDays: 5, usedDays: 1, remainingDays: 4 }
      ];
    } catch (error) {
      console.error("Error getting leave balance:", error);
      return [];
    }
  }

  async updateLeaveBalance(employeeId: number, year: number, leaveType: string, daysUsed: number): Promise<void> {
    try {
      // Mock implementation - should update actual leave balance table
      console.log(`Updating leave balance for employee ${employeeId}: ${leaveType} - ${daysUsed} days used`);
    } catch (error) {
      console.error("Error updating leave balance:", error);
    }
  }

  // ===== HR REQUESTS =====
  
  async getAllHrRequests(): Promise<HrRequest[]> {
    try {
      return await db.select().from(hrRequests).orderBy(desc(hrRequests.createdAt));
    } catch (error) {
      console.error("Error getting all HR requests:", error);
      return [];
    }
  }

  async getHrRequest(id: number): Promise<HrRequest | null> {
    try {
      const result = await db.select().from(hrRequests).where(eq(hrRequests.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting HR request:", error);
      return null;
    }
  }

  async createHrRequest(requestData: InsertHrRequest): Promise<HrRequest> {
    try {
      const result = await db.insert(hrRequests).values(requestData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating HR request:", error);
      throw new Error("Failed to create HR request");
    }
  }

  async updateHrRequest(id: number, requestData: Partial<InsertHrRequest>): Promise<HrRequest> {
    try {
      const result = await db.update(hrRequests)
        .set({
          ...requestData,
          updatedAt: new Date()
        })
        .where(eq(hrRequests.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("HR request not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating HR request:", error);
      throw new Error("Failed to update HR request");
    }
  }

  // ===== ANALYTICS AND KPIS =====
  
  async getKPIs(): Promise<any> {
    try {
      const totalJobs = await db.select({ count: count() }).from(jobs);
      const totalApplications = await db.select({ count: count() }).from(applications);
      const totalUsers = await db.select({ count: count() }).from(users);
      
      return {
        totalJobs: totalJobs[0]?.count || 0,
        totalApplications: totalApplications[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
        conversionRate: 0.15 // Mock data
      };
    } catch (error) {
      console.error("Error getting KPIs:", error);
      return {};
    }
  }

  async getApplicationAnalytics(): Promise<any> {
    try {
      // Mock analytics data
      return {
        monthlyApplications: [
          { month: "Jan", count: 45 },
          { month: "Feb", count: 52 },
          { month: "Mar", count: 38 },
          { month: "Apr", count: 61 },
          { month: "May", count: 55 }
        ],
        statusDistribution: [
          { name: "En attente", value: 35 },
          { name: "Examinées", value: 25 },
          { name: "Entretiens", value: 15 },
          { name: "Acceptées", value: 10 },
          { name: "Refusées", value: 15 }
        ],
        scoreDistribution: [
          { name: "0-20", count: 5 },
          { name: "21-40", count: 12 },
          { name: "41-60", count: 25 },
          { name: "61-80", count: 30 },
          { name: "81-100", count: 18 }
        ]
      };
    } catch (error) {
      console.error("Error getting application analytics:", error);
      return {};
    }
  }

  async getJobAnalytics(): Promise<any> {
    try {
      // Mock job analytics data
      return {
        jobPopularity: [
          { name: "Dev Full Stack", applications: 45 },
          { name: "UX Designer", applications: 32 },
          { name: "Chef de Projet", applications: 28 },
          { name: "DevOps", applications: 22 },
          { name: "Commercial", applications: 18 }
        ]
      };
    } catch (error) {
      console.error("Error getting job analytics:", error);
      return {};
    }
  }

  async getRecruiters(): Promise<User[]> {
    try {
      return await db.select().from(users)
        .where(or(
          eq(users.role, "recruiter"),
          eq(users.role, "hr"),
          eq(users.role, "admin")
        ));
    } catch (error) {
      console.error("Error getting recruiters:", error);
      return [];
    }
  }

  // ===== ONBOARDING MANAGEMENT =====
  
  async getAllOnboardingProcesses(): Promise<OnboardingProcess[]> {
    try {
      return await db.select().from(onboardingProcesses)
        .where(eq(onboardingProcesses.isActive, true))
        .orderBy(desc(onboardingProcesses.createdAt));
    } catch (error) {
      console.error("Error getting onboarding processes:", error);
      return [];
    }
  }

  async getOnboardingProcess(id: number): Promise<OnboardingProcess | null> {
    try {
      const result = await db.select().from(onboardingProcesses).where(eq(onboardingProcesses.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting onboarding process:", error);
      return null;
    }
  }

  async createOnboardingProcess(processData: InsertOnboardingProcess): Promise<OnboardingProcess> {
    try {
      const result = await db.insert(onboardingProcesses).values(processData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating onboarding process:", error);
      throw new Error("Failed to create onboarding process");
    }
  }

  async updateOnboardingProcess(id: number, processData: Partial<InsertOnboardingProcess>): Promise<OnboardingProcess> {
    try {
      const result = await db.update(onboardingProcesses)
        .set({
          ...processData,
          updatedAt: new Date()
        })
        .where(eq(onboardingProcesses.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Onboarding process not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating onboarding process:", error);
      throw new Error("Failed to update onboarding process");
    }
  }

  async getOnboardingStepsByProcess(processId: number): Promise<OnboardingStep[]> {
    try {
      return await db.select().from(onboardingSteps)
        .where(eq(onboardingSteps.processId, processId))
        .orderBy(onboardingSteps.stepNumber);
    } catch (error) {
      console.error("Error getting onboarding steps:", error);
      return [];
    }
  }

  async createOnboardingStep(stepData: InsertOnboardingStep): Promise<OnboardingStep> {
    try {
      const result = await db.insert(onboardingSteps).values(stepData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating onboarding step:", error);
      throw new Error("Failed to create onboarding step");
    }
  }

  async getCandidateOnboardingByUser(userId: string): Promise<CandidateOnboarding[]> {
    try {
      return await db.select().from(candidateOnboarding)
        .where(eq(candidateOnboarding.userId, userId))
        .orderBy(desc(candidateOnboarding.createdAt));
    } catch (error) {
      console.error("Error getting candidate onboarding by user:", error);
      return [];
    }
  }

  async getCandidateOnboarding(id: number): Promise<CandidateOnboarding | null> {
    try {
      const result = await db.select().from(candidateOnboarding).where(eq(candidateOnboarding.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting candidate onboarding:", error);
      return null;
    }
  }

  async createCandidateOnboarding(onboardingData: InsertCandidateOnboarding): Promise<CandidateOnboarding> {
    try {
      const result = await db.insert(candidateOnboarding).values(onboardingData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating candidate onboarding:", error);
      throw new Error("Failed to create candidate onboarding");
    }
  }

  async getStepCompletionsByOnboarding(onboardingId: number): Promise<OnboardingStepCompletion[]> {
    try {
      const result = await db.select({
        id: onboardingStepCompletions.id,
        candidateOnboardingId: onboardingStepCompletions.candidateOnboardingId,
        stepId: onboardingStepCompletions.stepId,
        status: onboardingStepCompletions.status,
        startDate: onboardingStepCompletions.startDate,
        completionDate: onboardingStepCompletions.completionDate,
        completedBy: onboardingStepCompletions.completedBy,
        notes: onboardingStepCompletions.notes,
        attachments: onboardingStepCompletions.attachments,
        validationRequired: onboardingStepCompletions.validationRequired,
        validatedBy: onboardingStepCompletions.validatedBy,
        validationDate: onboardingStepCompletions.validationDate,
        createdAt: onboardingStepCompletions.createdAt,
        updatedAt: onboardingStepCompletions.updatedAt,
        step: {
          id: onboardingSteps.id,
          processId: onboardingSteps.processId,
          stepNumber: onboardingSteps.stepNumber,
          title: onboardingSteps.title,
          description: onboardingSteps.description,
          category: onboardingSteps.category,
          isRequired: onboardingSteps.isRequired,
          estimatedDuration: onboardingSteps.estimatedDuration,
          assignedRole: onboardingSteps.assignedRole
        }
      })
      .from(onboardingStepCompletions)
      .leftJoin(onboardingSteps, eq(onboardingStepCompletions.stepId, onboardingSteps.id))
      .where(eq(onboardingStepCompletions.candidateOnboardingId, onboardingId))
      .orderBy(onboardingSteps.stepNumber);
      
      return result;
    } catch (error) {
      console.error("Error getting step completions:", error);
      return [];
    }
  }

  async updateStepCompletion(id: number, completionData: Partial<InsertStepCompletion>): Promise<OnboardingStepCompletion> {
    try {
      const result = await db.update(onboardingStepCompletions)
        .set({
          ...completionData,
          updatedAt: new Date()
        })
        .where(eq(onboardingStepCompletions.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Step completion not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating step completion:", error);
      throw new Error("Failed to update step completion");
    }
  }

  async getOnboardingAnalytics(): Promise<any> {
    try {
      // Mock analytics data
      return {
        overview: {
          totalOnboardings: 25,
          completionRate: 85,
          averageCompletionTime: 18,
          inProgressOnboardings: 8
        },
        monthlyProgress: [
          { month: "Jan", started: 8, completed: 6 },
          { month: "Feb", started: 12, completed: 10 },
          { month: "Mar", started: 15, completed: 12 },
          { month: "Apr", started: 10, completed: 9 },
          { month: "May", started: 7, completed: 5 }
        ],
        departmentStats: [
          { department: "Aviation", total: 15, completed: 12 },
          { department: "Sécurité", total: 8, completed: 7 },
          { department: "Administration", total: 5, completed: 4 }
        ],
        stepPerformance: [
          { stepTitle: "Formation Sécurité", category: "formation", totalCompletions: 20, completionRate: 65 },
          { stepTitle: "Remise Badge", category: "administrative", totalCompletions: 25, completionRate: 95 }
        ]
      };
    } catch (error) {
      console.error("Error getting onboarding analytics:", error);
      return {};
    }
  }

  async getOnboardingProcessTemplates(): Promise<any[]> {
    try {
      // Mock templates data
      return [
        {
          id: 1,
          name: "Onboarding Standard Aviation",
          description: "Processus d'intégration pour le personnel navigant",
          department: "Aviation",
          estimatedDuration: 30,
          steps: [
            { title: "Formation Sécurité Aéroportuaire", category: "formation", duration: 8 },
            { title: "Remise Badge d'Accès", category: "administrative", duration: 2 },
            { title: "Formation Équipements", category: "technique", duration: 16 },
            { title: "Évaluation Finale", category: "administrative", duration: 4 }
          ]
        },
        {
          id: 2,
          name: "Onboarding Sécurité",
          description: "Processus pour les agents de sécurité",
          department: "Sécurité",
          estimatedDuration: 21,
          steps: [
            { title: "Formation Réglementaire", category: "formation", duration: 12 },
            { title: "Habilitation Sécuritaire", category: "administrative", duration: 4 },
            { title: "Formation Pratique", category: "technique", duration: 5 }
          ]
        }
      ];
    } catch (error) {
      console.error("Error getting process templates:", error);
      return [];
    }
  }

  // ===== FEEDBACK AND ACHIEVEMENTS =====
  
  async createOnboardingFeedback(feedbackData: InsertOnboardingFeedback): Promise<OnboardingFeedback> {
    try {
      const result = await db.insert(onboardingFeedback).values(feedbackData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating onboarding feedback:", error);
      throw new Error("Failed to create onboarding feedback");
    }
  }

  async getOnboardingFeedback(candidateOnboardingId?: number): Promise<OnboardingFeedback[]> {
    try {
      let query = db.select().from(onboardingFeedback);
      
      if (candidateOnboardingId) {
        query = query.where(eq(onboardingFeedback.candidateOnboardingId, candidateOnboardingId));
      }
      
      return await query.orderBy(desc(onboardingFeedback.createdAt));
    } catch (error) {
      console.error("Error getting onboarding feedback:", error);
      return [];
    }
  }

  async getAchievements(): Promise<OnboardingAchievement[]> {
    try {
      return await db.select().from(onboardingAchievements)
        .where(eq(onboardingAchievements.isActive, true))
        .orderBy(onboardingAchievements.category, onboardingAchievements.name);
    } catch (error) {
      console.error("Error getting achievements:", error);
      return [];
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const result = await db.select({
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
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
      
      return result;
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return [];
    }
  }

  async awardAchievement(userId: string, achievementId: number, candidateOnboardingId?: number): Promise<UserAchievement> {
    try {
      const result = await db.insert(userAchievements).values({
        userId,
        achievementId,
        candidateOnboardingId: candidateOnboardingId || null
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error awarding achievement:", error);
      throw new Error("Failed to award achievement");
    }
  }

  async initializeDefaultAchievements(): Promise<void> {
    try {
      const defaultAchievements = [
        {
          name: "Premier Pas",
          description: "Commencer votre processus d'onboarding",
          icon: "Star",
          category: "milestone",
          points: 10
        },
        {
          name: "Rapide comme l'Éclair",
          description: "Terminer une étape en moins d'une heure",
          icon: "Zap",
          category: "speed",
          points: 15
        },
        {
          name: "Pilote Confirmé",
          description: "Terminer toutes les formations obligatoires",
          icon: "Plane",
          category: "milestone",
          points: 25
        },
        {
          name: "Communicateur Expert",
          description: "Laisser un feedback détaillé",
          icon: "MessageSquare",
          category: "engagement",
          points: 20
        },
        {
          name: "Gardien de la Sécurité",
          description: "Réussir toutes les formations de sécurité",
          icon: "Shield",
          category: "quality",
          points: 30
        },
        {
          name: "Champion de l'Onboarding",
          description: "Terminer l'onboarding avec 100% de réussite",
          icon: "Award",
          category: "milestone",
          points: 50
        }
      ];

      for (const achievement of defaultAchievements) {
        try {
          await db.insert(onboardingAchievements).values(achievement).onConflictDoNothing();
        } catch (error) {
          // Ignore conflicts (achievement already exists)
        }
      }
    } catch (error) {
      console.error("Error initializing default achievements:", error);
    }
  }

  // ===== CALENDAR EVENTS =====
  
  async createOnboardingEvent(eventData: InsertOnboardingEvent): Promise<OnboardingEvent> {
    try {
      const result = await db.insert(onboardingEvents).values(eventData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating onboarding event:", error);
      throw new Error("Failed to create onboarding event");
    }
  }

  async getOnboardingEvents(candidateOnboardingId?: number): Promise<OnboardingEvent[]> {
    try {
      let query = db.select().from(onboardingEvents);
      
      if (candidateOnboardingId) {
        query = query.where(eq(onboardingEvents.candidateOnboardingId, candidateOnboardingId));
      }
      
      return await query.orderBy(onboardingEvents.startDateTime);
    } catch (error) {
      console.error("Error getting onboarding events:", error);
      return [];
    }
  }

  async updateOnboardingEvent(id: number, eventData: Partial<InsertOnboardingEvent>): Promise<OnboardingEvent> {
    try {
      const result = await db.update(onboardingEvents)
        .set({
          ...eventData,
          updatedAt: new Date()
        })
        .where(eq(onboardingEvents.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Onboarding event not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating onboarding event:", error);
      throw new Error("Failed to update onboarding event");
    }
  }

  // ===== INTERVIEW MANAGEMENT =====
  
  async getInterviews(): Promise<Interview[]> {
    try {
      const result = await db.select({
        id: interviews.id,
        candidateId: interviews.candidateId,
        applicationId: interviews.applicationId,
        interviewerId: interviews.interviewerId,
        interviewType: interviews.interviewType,
        scheduledDateTime: interviews.scheduledDateTime,
        duration: interviews.duration,
        location: interviews.location,
        meetingLink: interviews.meetingLink,
        status: interviews.status,
        notes: interviews.notes,
        createdBy: interviews.createdBy,
        createdAt: interviews.createdAt,
        updatedAt: interviews.updatedAt,
        application: {
          id: applications.id,
          candidateName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          jobTitle: jobs.title
        }
      })
      .from(interviews)
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .leftJoin(users, eq(applications.userId, users.id))
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .orderBy(desc(interviews.scheduledDateTime));
      
      return result;
    } catch (error) {
      console.error("Error getting interviews:", error);
      return [];
    }
  }

  async createInterview(interviewData: InsertInterview): Promise<Interview> {
    try {
      const result = await db.insert(interviews).values(interviewData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating interview:", error);
      throw new Error("Failed to create interview");
    }
  }

  async createInterviewEvaluation(evaluationData: InsertInterviewEvaluation): Promise<InterviewEvaluation> {
    try {
      const result = await db.insert(interviewEvaluations).values(evaluationData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating interview evaluation:", error);
      throw new Error("Failed to create interview evaluation");
    }
  }

  async createInterviewFeedback(feedbackData: InsertInterviewFeedback): Promise<InterviewFeedback> {
    try {
      const result = await db.insert(interviewFeedback).values(feedbackData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating interview feedback:", error);
      throw new Error("Failed to create interview feedback");
    }
  }

  // ===== PERFORMANCE AND TRAINING =====
  
  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    try {
      const result = await db.select({
        id: performanceReviews.id,
        employeeId: performanceReviews.employeeId,
        reviewerId: performanceReviews.reviewerId,
        reviewPeriod: performanceReviews.reviewPeriod,
        reviewType: performanceReviews.reviewType,
        overallRating: performanceReviews.overallRating,
        goals: performanceReviews.goals,
        achievements: performanceReviews.achievements,
        areasForImprovement: performanceReviews.areasForImprovement,
        developmentPlan: performanceReviews.developmentPlan,
        managerComments: performanceReviews.managerComments,
        employeeComments: performanceReviews.employeeComments,
        status: performanceReviews.status,
        reviewDate: performanceReviews.reviewDate,
        nextReviewDate: performanceReviews.nextReviewDate,
        createdAt: performanceReviews.createdAt,
        updatedAt: performanceReviews.updatedAt,
        employee: {
          id: employees.id,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(performanceReviews)
      .leftJoin(employees, eq(performanceReviews.employeeId, employees.id))
      .leftJoin(users, eq(employees.userId, users.id))
      .orderBy(desc(performanceReviews.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting performance reviews:", error);
      return [];
    }
  }

  async createPerformanceReview(reviewData: InsertPerformanceReview): Promise<PerformanceReview> {
    try {
      const result = await db.insert(performanceReviews).values(reviewData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating performance review:", error);
      throw new Error("Failed to create performance review");
    }
  }

  async getTrainingPrograms(): Promise<TrainingProgram[]> {
    try {
      return await db.select().from(trainingPrograms)
        .where(eq(trainingPrograms.isActive, true))
        .orderBy(desc(trainingPrograms.createdAt));
    } catch (error) {
      console.error("Error getting training programs:", error);
      return [];
    }
  }

  async createTrainingProgram(programData: InsertTrainingProgram): Promise<TrainingProgram> {
    try {
      const result = await db.insert(trainingPrograms).values(programData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating training program:", error);
      throw new Error("Failed to create training program");
    }
  }

  async getEmployeeTraining(): Promise<EmployeeTraining[]> {
    try {
      const result = await db.select({
        id: employeeTraining.id,
        employeeId: employeeTraining.employeeId,
        trainingProgramId: employeeTraining.trainingProgramId,
        status: employeeTraining.status,
        enrollmentDate: employeeTraining.enrollmentDate,
        startDate: employeeTraining.startDate,
        completionDate: employeeTraining.completionDate,
        expirationDate: employeeTraining.expirationDate,
        score: employeeTraining.score,
        certificate: employeeTraining.certificate,
        assignedBy: employeeTraining.assignedBy,
        notes: employeeTraining.notes,
        createdAt: employeeTraining.createdAt,
        updatedAt: employeeTraining.updatedAt,
        employee: {
          id: employees.id,
          firstName: users.firstName,
          lastName: users.lastName
        },
        program: {
          id: trainingPrograms.id,
          name: trainingPrograms.name,
          category: trainingPrograms.category
        }
      })
      .from(employeeTraining)
      .leftJoin(employees, eq(employeeTraining.employeeId, employees.id))
      .leftJoin(users, eq(employees.userId, users.id))
      .leftJoin(trainingPrograms, eq(employeeTraining.trainingProgramId, trainingPrograms.id))
      .orderBy(desc(employeeTraining.createdAt));
      
      return result;
    } catch (error) {
      console.error("Error getting employee training:", error);
      return [];
    }
  }

  async createEmployeeTraining(trainingData: InsertEmployeeTraining): Promise<EmployeeTraining> {
    try {
      const result = await db.insert(employeeTraining).values(trainingData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating employee training:", error);
      throw new Error("Failed to create employee training");
    }
  }

  async getTimeEntries(): Promise<TimeEntry[]> {
    try {
      const result = await db.select({
        id: timeEntries.id,
        employeeId: timeEntries.employeeId,
        entryDate: timeEntries.entryDate,
        clockIn: timeEntries.clockIn,
        clockOut: timeEntries.clockOut,
        breakStart: timeEntries.breakStart,
        breakEnd: timeEntries.breakEnd,
        totalHours: timeEntries.totalHours,
        overtimeHours: timeEntries.overtimeHours,
        entryType: timeEntries.entryType,
        location: timeEntries.location,
        notes: timeEntries.notes,
        approvedBy: timeEntries.approvedBy,
        status: timeEntries.status,
        createdAt: timeEntries.createdAt,
        updatedAt: timeEntries.updatedAt,
        employee: {
          id: employees.id,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(timeEntries)
      .leftJoin(employees, eq(timeEntries.employeeId, employees.id))
      .leftJoin(users, eq(employees.userId, users.id))
      .orderBy(desc(timeEntries.entryDate));
      
      return result;
    } catch (error) {
      console.error("Error getting time entries:", error);
      return [];
    }
  }

  async createTimeEntry(timeData: InsertTimeEntry): Promise<TimeEntry> {
    try {
      const result = await db.insert(timeEntries).values(timeData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating time entry:", error);
      throw new Error("Failed to create time entry");
    }
  }

  // ===== CANDIDATE INVITATIONS =====
  
  async getCandidateInvitations(): Promise<CandidateInvitation[]> {
    try {
      return await db.select().from(candidateInvitations)
        .orderBy(desc(candidateInvitations.createdAt));
    } catch (error) {
      console.error("Error getting candidate invitations:", error);
      return [];
    }
  }

  async getCandidateInvitationByToken(token: string): Promise<CandidateInvitation | null> {
    try {
      const result = await db.select().from(candidateInvitations)
        .where(eq(candidateInvitations.invitationToken, token))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting candidate invitation by token:", error);
      return null;
    }
  }

  async createCandidateInvitation(invitationData: InsertCandidateInvitation): Promise<CandidateInvitation> {
    try {
      const result = await db.insert(candidateInvitations).values(invitationData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating candidate invitation:", error);
      throw new Error("Failed to create candidate invitation");
    }
  }

  async updateCandidateInvitation(id: number, data: Partial<InsertCandidateInvitation>): Promise<CandidateInvitation> {
    try {
      const result = await db.update(candidateInvitations)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(candidateInvitations.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Candidate invitation not found");
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating candidate invitation:", error);
      throw new Error("Failed to update candidate invitation");
    }
  }
}

export const storage: IStorage = new DatabaseStorage();