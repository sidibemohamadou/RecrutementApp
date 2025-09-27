import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports both Replit Auth and email/password)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // For email/password authentication (nullable for Replit users)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  role: text("role").default("candidate"), // candidate, recruiter, hr, admin
  
  // Département de travail
  department: varchar("department"),
  
  // Informations personnelles détaillées
  gender: text("gender"), // Homme, Femme, Autre
  maritalStatus: text("marital_status"), // Célibataire, Marié(e), Divorcé(e), Veuf(ve)
  address: text("address"),
  residencePlace: varchar("residence_place"),
  
  // Pièce d'identité
  idDocumentType: text("id_document_type"), // CNI, Passeport, Permis de séjour
  idDocumentNumber: varchar("id_document_number"),
  
  // Informations de naissance
  birthDate: timestamp("birth_date"),
  birthPlace: varchar("birth_place"),
  birthCountry: varchar("birth_country"),
  nationality: varchar("nationality"),
  
  // Profil complété
  profileCompleted: boolean("profile_completed").default(false),
  
  // Identifiant employé unique basé sur les initiales
  employeeId: varchar("employee_id").unique(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job postings table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  salary: text("salary"),
  contractType: text("contract_type").notNull(), // CDI, CDD, Freelance  
  experienceLevel: text("experience_level"), // Débutant, Intermédiaire, Senior
  skills: text("skills").array(),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  status: text("status").notNull().default("pending"), // pending, reviewed, interview, accepted, rejected
  coverLetter: text("cover_letter"),
  cvPath: text("cv_path"),
  motivationLetterPath: text("motivation_letter_path"),
  diplomaPath: text("diploma_path"), // Chemin vers la copie du diplôme
  availability: timestamp("availability_date"),
  salaryExpectation: text("salary_expectation"),
  phone: varchar("phone"),
  assignedRecruiter: varchar("assigned_recruiter").references(() => users.id), // Recruteur assigné
  autoScore: integer("auto_score").default(0), // Score automatique (0-100)
  manualScore: integer("manual_score"), // Note manuelle du recruteur (0-100)
  scoreNotes: text("score_notes"), // Commentaires du recruteur
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table - pour les candidats devenus employés
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeNumber: varchar("employee_number").notNull().unique(),
  department: text("department"),
  position: text("position").notNull(),
  manager: varchar("manager_id").references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: text("status").notNull().default("active"), // active, inactive, terminated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts table - gestion des contrats
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  applicationId: integer("application_id").references(() => applications.id),
  contractType: text("contract_type").notNull(), // CDI, CDD, Stage, Freelance
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  trialPeriodEnd: date("trial_period_end"),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR"),
  workingHours: integer("working_hours").default(35), // heures par semaine
  vacationDays: integer("vacation_days").default(25), // jours de congés annuels
  signatureStatus: text("signature_status").default("pending"), // pending, signed, rejected
  signedAt: timestamp("signed_at"),
  contractPath: text("contract_path"), // chemin vers le PDF du contrat
  notes: text("notes"),
  status: text("status").notNull().default("draft"), // draft, active, terminated, expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contract amendments table - avenants
export const contractAmendments = pgTable("contract_amendments", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  amendmentType: text("amendment_type").notNull(), // salary_change, role_change, schedule_change, etc.
  description: text("description").notNull(),
  effectiveDate: date("effective_date").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value").notNull(),
  signatureStatus: text("signature_status").default("pending"),
  signedAt: timestamp("signed_at"),
  documentPath: text("document_path"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payroll table - gestion des salaires
export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  period: text("period").notNull(), // YYYY-MM format
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0"),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  socialCharges: decimal("social_charges", { precision: 10, scale: 2 }).default("0"),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  workingDays: integer("working_days").default(22),
  absenceDays: integer("absence_days").default(0),
  status: text("status").default("draft"), // draft, validated, paid
  paymentDate: date("payment_date"),
  payslipPath: text("payslip_path"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave requests table - demandes de congés
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(), // vacation, sick, personal, maternity, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  reason: text("reason"),
  status: text("status").default("pending"), // pending, approved, rejected, cancelled
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  substituteCoverage: varchar("substitute_coverage").references(() => users.id),
  emergencyContact: text("emergency_contact"),
  attachmentPath: text("attachment_path"), // certificat médical, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leave balances table - soldes de congés
export const leaveBalances = pgTable("leave_balances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  year: integer("year").notNull(),
  leaveType: text("leave_type").notNull(),
  totalDays: integer("total_days").notNull(),
  usedDays: integer("used_days").default(0),
  remainingDays: integer("remaining_days").notNull(),
  carriedOverDays: integer("carried_over_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HR requests table - demandes internes RH
export const hrRequests = pgTable("hr_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  requestType: text("request_type").notNull(), // address_change, equipment, certificate, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  status: text("status").default("pending"), // pending, in_progress, completed, rejected
  assignedTo: varchar("assigned_to").references(() => users.id),
  attachmentPath: text("attachment_path"),
  responseNotes: text("response_notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding Process Templates table - définit les modèles de processus d'onboarding
export const onboardingProcesses = pgTable("onboarding_processes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Ex: "Onboarding Standard Aviation", "Processus Sécurité Aéroport"
  description: text("description"),
  department: text("department"), // Aviation, Sécurité, Administration, etc.
  isActive: boolean("is_active").default(true),
  estimatedDuration: integer("estimated_duration"), // Durée estimée en jours
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding Steps table - définit les étapes de chaque processus
export const onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  processId: integer("process_id").notNull().references(() => onboardingProcesses.id),
  stepNumber: integer("step_number").notNull(), // Ordre de l'étape
  title: text("title").notNull(), // Ex: "Formation Sécurité", "Remise Badge d'Accès"
  description: text("description"),
  category: text("category"), // documentation, formation, administrative, technique
  isRequired: boolean("is_required").default(true),
  estimatedDuration: integer("estimated_duration"), // Durée estimée en heures
  assignedRole: text("assigned_role"), // admin, hr, security, supervisor
  requiredDocuments: text("required_documents").array(), // Documents nécessaires
  completionCriteria: text("completion_criteria"), // Critères de validation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidate Onboarding table - instance d'onboarding pour un candidat spécifique
export const candidateOnboarding = pgTable("candidate_onboarding", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  processId: integer("process_id").notNull().references(() => onboardingProcesses.id),
  applicationId: integer("application_id").references(() => applications.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, suspended
  startDate: date("start_date"),
  expectedCompletionDate: date("expected_completion_date"),
  actualCompletionDate: date("actual_completion_date"),
  assignedMentor: varchar("assigned_mentor").references(() => users.id), // Mentor assigné
  progress: integer("progress").default(0), // Pourcentage de progression (0-100)
  notes: text("notes"), // Notes générales sur l'onboarding
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding Step Completions table - suivi de la complétion de chaque étape
export const onboardingStepCompletions = pgTable("onboarding_step_completions", {
  id: serial("id").primaryKey(),
  candidateOnboardingId: integer("candidate_onboarding_id").notNull().references(() => candidateOnboarding.id),
  stepId: integer("step_id").notNull().references(() => onboardingSteps.id),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, skipped, blocked
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  completedBy: varchar("completed_by").references(() => users.id), // Qui a validé l'étape
  notes: text("notes"), // Commentaires sur l'étape
  attachments: text("attachments").array(), // Fichiers joints (certificats, etc.)
  validationRequired: boolean("validation_required").default(false),
  validatedBy: varchar("validated_by").references(() => users.id),
  validationDate: timestamp("validation_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding notifications
export const onboardingNotifications = pgTable("onboarding_notifications", {
  id: serial("id").primaryKey(),
  candidateOnboardingId: integer("candidate_onboarding_id").references(() => candidateOnboarding.id).notNull(),
  recipientId: varchar("recipient_id", { length: 255 }).notNull(), // User ID
  type: varchar("type", { length: 50 }).notNull(), // step_completed, step_overdue, process_completed, reminder
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  relatedStepId: integer("related_step_id").references(() => onboardingSteps.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Onboarding communications
export const onboardingCommunications = pgTable("onboarding_communications", {
  id: serial("id").primaryKey(),
  candidateOnboardingId: integer("candidate_onboarding_id").references(() => candidateOnboarding.id).notNull(),
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  senderRole: varchar("sender_role", { length: 50 }).notNull(), // candidate, mentor, admin
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow()
});

// Onboarding feedback from candidates
export const onboardingFeedback = pgTable("onboarding_feedback", {
  id: serial("id").primaryKey(),
  candidateOnboardingId: integer("candidate_onboarding_id").references(() => candidateOnboarding.id).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  stepId: integer("step_id").references(() => onboardingSteps.id),
  overallRating: integer("overall_rating").notNull(), // 1-5 stars
  stepRating: integer("step_rating"), // 1-5 stars for specific step
  clarity: integer("clarity").notNull(), // 1-5 stars
  support: integer("support").notNull(), // 1-5 stars  
  usefulness: integer("usefulness").notNull(), // 1-5 stars
  comments: text("comments"),
  suggestions: text("suggestions"),
  wouldRecommend: boolean("would_recommend"),
  createdAt: timestamp("created_at").defaultNow()
});

// Onboarding achievements/badges
export const onboardingAchievements = pgTable("onboarding_achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }), // lucide icon name
  category: varchar("category", { length: 50 }), // speed, quality, engagement, milestone
  criteria: text("criteria"), // JSON criteria for earning
  points: integer("points").default(10),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// User achievements tracking
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  achievementId: integer("achievement_id").references(() => onboardingAchievements.id).notNull(),
  candidateOnboardingId: integer("candidate_onboarding_id").references(() => candidateOnboarding.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Calendar events for onboarding
export const onboardingEvents = pgTable("onboarding_events", {
  id: serial("id").primaryKey(),
  candidateOnboardingId: integer("candidate_onboarding_id").references(() => candidateOnboarding.id).notNull(),
  stepId: integer("step_id").references(() => onboardingSteps.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }), // training, meeting, deadline, review
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time"),
  location: varchar("location", { length: 255 }),
  attendees: text("attendees").array(), // user IDs
  isRecurring: boolean("is_recurring").default(false),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Interview sessions for candidate evaluation
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  candidateId: varchar("candidate_id", { length: 255 }).notNull(),
  applicationId: integer("application_id").references(() => applications.id),
  interviewerId: varchar("interviewer_id", { length: 255 }).notNull(),
  interviewType: varchar("interview_type", { length: 50 }).notNull(), // phone, video, onsite, technical
  scheduledDateTime: timestamp("scheduled_date_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  location: varchar("location", { length: 255 }),
  meetingLink: varchar("meeting_link", { length: 500 }),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled, no_show
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Interview evaluations and scoring
export const interviewEvaluations = pgTable("interview_evaluations", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").references(() => interviews.id).notNull(),
  criteriaName: varchar("criteria_name", { length: 255 }).notNull(), // Technical Skills, Communication, Problem Solving, etc.
  score: integer("score").notNull(), // 1-10 scale
  maxScore: integer("max_score").default(10),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow()
});

// Overall interview feedback
export const interviewFeedback = pgTable("interview_feedback", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").references(() => interviews.id).notNull(),
  overallScore: integer("overall_score").notNull(), // 1-100
  recommendation: varchar("recommendation", { length: 50 }).notNull(), // hire, reject, second_interview
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  detailedFeedback: text("detailed_feedback"),
  culturalFit: integer("cultural_fit"), // 1-10 scale
  technicalCompetency: integer("technical_competency"), // 1-10 scale
  communicationSkills: integer("communication_skills"), // 1-10 scale
  problemSolving: integer("problem_solving"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow()
});

// Employee performance reviews
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  reviewerId: varchar("reviewer_id", { length: 255 }).notNull(),
  reviewPeriod: varchar("review_period", { length: 100 }).notNull(), // Q1 2024, Annual 2024, etc.
  reviewType: varchar("review_type", { length: 50 }).default("annual"), // annual, quarterly, probation
  overallRating: integer("overall_rating").notNull(), // 1-5 scale
  goals: text("goals"),
  achievements: text("achievements"),
  areasForImprovement: text("areas_for_improvement"),
  developmentPlan: text("development_plan"),
  managerComments: text("manager_comments"),
  employeeComments: text("employee_comments"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, completed, acknowledged
  reviewDate: timestamp("review_date").notNull(),
  nextReviewDate: timestamp("next_review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Training programs and courses
export const trainingPrograms = pgTable("training_programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // safety, technical, compliance, leadership
  duration: integer("duration"), // in hours
  isRequired: boolean("is_required").default(false),
  expirationMonths: integer("expiration_months"), // how many months before recertification needed
  provider: varchar("provider", { length: 255 }),
  cost: varchar("cost", { length: 50 }),
  maxParticipants: integer("max_participants"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Employee training records
export const employeeTraining = pgTable("employee_training", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  trainingProgramId: integer("training_program_id").references(() => trainingPrograms.id).notNull(),
  status: varchar("status", { length: 20 }).default("enrolled"), // enrolled, in_progress, completed, failed
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  expirationDate: timestamp("expiration_date"),
  score: integer("score"), // percentage score if applicable
  certificate: varchar("certificate", { length: 500 }), // path to certificate file
  assignedBy: varchar("assigned_by", { length: 255 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Disciplinary actions
export const disciplinaryActions = pgTable("disciplinary_actions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(), // verbal_warning, written_warning, suspension, termination
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description").notNull(),
  actionDate: timestamp("action_date").notNull(),
  issuedBy: varchar("issued_by", { length: 255 }).notNull(),
  witnessedBy: varchar("witnessed_by", { length: 255 }),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  employeeResponse: text("employee_response"),
  status: varchar("status", { length: 20 }).default("active"), // active, resolved, appealed
  attachments: text("attachments").array(), // document paths
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Employee documents management
export const employeeDocuments = pgTable("employee_documents", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(), // contract, id_copy, diploma, certificate
  documentName: varchar("document_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
  isConfidential: boolean("is_confidential").default(true),
  expirationDate: timestamp("expiration_date"),
  tags: text("tags").array(),
  notes: text("notes"),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Time tracking and attendance
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  entryDate: timestamp("entry_date").notNull(),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  totalHours: varchar("total_hours", { length: 10 }), // HH:MM format
  overtimeHours: varchar("overtime_hours", { length: 10 }), // HH:MM format
  entryType: varchar("entry_type", { length: 20 }).default("regular"), // regular, overtime, holiday
  location: varchar("location", { length: 255 }),
  notes: text("notes"),
  approvedBy: varchar("approved_by", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Export schemas for validation
export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  isActive: z.boolean().optional().transform((val) => val ? 1 : 0)
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAmendmentSchema = createInsertSchema(contractAmendments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHrRequestSchema = createInsertSchema(hrRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateApplicationSchema = insertApplicationSchema.partial();

// Onboarding schemas
export const insertOnboardingProcessSchema = createInsertSchema(onboardingProcesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingStepSchema = createInsertSchema(onboardingSteps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateOnboardingSchema = createInsertSchema(candidateOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStepCompletionSchema = createInsertSchema(onboardingStepCompletions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingNotificationSchema = createInsertSchema(onboardingNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingCommunicationSchema = createInsertSchema(onboardingCommunications).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingFeedbackSchema = createInsertSchema(onboardingFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingAchievementSchema = createInsertSchema(onboardingAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertOnboardingEventSchema = createInsertSchema(onboardingEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewEvaluationSchema = createInsertSchema(interviewEvaluations).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewFeedbackSchema = createInsertSchema(interviewFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeTrainingSchema = createInsertSchema(employeeTraining).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDisciplinaryActionSchema = createInsertSchema(disciplinaryActions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type UpdateApplication = z.infer<typeof updateApplicationSchema>;

// New HR module types
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type ContractAmendment = typeof contractAmendments.$inferSelect;
export type InsertAmendment = z.infer<typeof insertAmendmentSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type HrRequest = typeof hrRequests.$inferSelect;
export type InsertHrRequest = z.infer<typeof insertHrRequestSchema>;

// Onboarding types
export type OnboardingProcess = typeof onboardingProcesses.$inferSelect;
export type InsertOnboardingProcess = z.infer<typeof insertOnboardingProcessSchema>;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = z.infer<typeof insertOnboardingStepSchema>;
export type CandidateOnboarding = typeof candidateOnboarding.$inferSelect;
export type InsertCandidateOnboarding = z.infer<typeof insertCandidateOnboardingSchema>;
export type OnboardingStepCompletion = typeof onboardingStepCompletions.$inferSelect;
export type InsertStepCompletion = z.infer<typeof insertStepCompletionSchema>;
export type OnboardingNotification = typeof onboardingNotifications.$inferSelect;
export type InsertOnboardingNotification = z.infer<typeof insertOnboardingNotificationSchema>;
export type OnboardingCommunication = typeof onboardingCommunications.$inferSelect;
export type InsertOnboardingCommunication = z.infer<typeof insertOnboardingCommunicationSchema>;
export type OnboardingFeedback = typeof onboardingFeedback.$inferSelect;
export type InsertOnboardingFeedback = z.infer<typeof insertOnboardingFeedbackSchema>;
export type OnboardingAchievement = typeof onboardingAchievements.$inferSelect;
export type InsertOnboardingAchievement = z.infer<typeof insertOnboardingAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type OnboardingEvent = typeof onboardingEvents.$inferSelect;
export type InsertOnboardingEvent = z.infer<typeof insertOnboardingEventSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type InterviewEvaluation = typeof interviewEvaluations.$inferSelect;
export type InsertInterviewEvaluation = z.infer<typeof insertInterviewEvaluationSchema>;
export type InterviewFeedback = typeof interviewFeedback.$inferSelect;
export type InsertInterviewFeedback = z.infer<typeof insertInterviewFeedbackSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;
export type EmployeeTraining = typeof employeeTraining.$inferSelect;
export type InsertEmployeeTraining = z.infer<typeof insertEmployeeTrainingSchema>;
export type DisciplinaryAction = typeof disciplinaryActions.$inferSelect;
export type InsertDisciplinaryAction = z.infer<typeof insertDisciplinaryActionSchema>;
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

// Table des invitations candidats pour présélectionnés
export const candidateInvitations = pgTable("candidate_invitations", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  applicationId: integer("application_id").references(() => applications.id),
  invitationToken: varchar("invitation_token").notNull().unique(),
  status: text("status").notNull().default("sent"), // sent, opened, completed, expired
  sentBy: varchar("sent_by").notNull().references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
  emailContent: text("email_content"),
  personalMessage: text("personal_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCandidateInvitationSchema = createInsertSchema(candidateInvitations);
export type InsertCandidateInvitation = typeof candidateInvitations.$inferInsert;
export type CandidateInvitation = typeof candidateInvitations.$inferSelect;
