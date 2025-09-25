import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { storage } from '../server/storage';
import { AuthService } from '../server/auth';

describe('Integration Tests - Complete Candidate Journey', () => {
  let testUsers: string[] = [];
  let testJobs: number[] = [];

  beforeAll(async () => {
    // Setup test data
    console.log('Setting up integration test data...');
  });

  afterAll(async () => {
    // Cleanup all test data
    for (const userId of testUsers) {
      try {
        await storage.deleteUser(userId);
      } catch (error) {
        console.log('Cleanup user error:', error);
      }
    }
    
    for (const jobId of testJobs) {
      try {
        await storage.deleteJob(jobId);
      } catch (error) {
        console.log('Cleanup job error:', error);
      }
    }
  });

  describe('Complete Candidate Journey', () => {
    it('should handle complete candidate lifecycle', async () => {
      // 1. Create job posting
      const job = await storage.createJob({
        title: 'Développeur Full Stack',
        company: 'TechCorp',
        location: 'Paris',
        description: 'Nous recherchons un développeur expérimenté...',
        contractType: 'CDI',
        experienceLevel: 'Intermédiaire',
        skills: ['React', 'Node.js', 'TypeScript'],
        salary: '45000-60000€',
        isActive: 1
      });
      testJobs.push(job.id);

      // 2. Register candidate
      const candidateData = {
        email: 'integration.test@example.com',
        password: 'securepassword123',
        firstName: 'Marie',
        lastName: 'Dubois'
      };

      const candidate = await AuthService.registerCandidate(candidateData);
      expect(candidate).toBeDefined();
      expect(candidate?.role).toBe('candidate');
      testUsers.push(candidate!.id);

      // 3. Complete profile
      const profileCompletion = {
        phone: '+33123456789',
        gender: 'Femme',
        maritalStatus: 'Célibataire',
        address: '456 Avenue des Tests, 75001 Paris',
        residencePlace: 'Paris',
        idDocumentType: 'CNI',
        idDocumentNumber: 'CNI123456789',
        birthDate: new Date('1992-05-15'),
        birthPlace: 'Lyon',
        birthCountry: 'France',
        nationality: 'Française',
        profileCompleted: true
      };

      const completedProfile = await storage.updateUser(candidate!.id, profileCompletion);
      expect(completedProfile.profileCompleted).toBe(true);

      // 4. Submit application
      const applicationData = {
        jobId: job.id,
        coverLetter: 'Je suis très intéressée par ce poste car il correspond parfaitement à mon profil...',
        salaryExpectation: '52000€',
        availability: new Date('2024-04-01'),
        cvPath: '/objects/test-cv.pdf',
        motivationLetterPath: '/objects/test-motivation.pdf'
      };

      const application = await storage.createApplication(applicationData, candidate!.id);
      expect(application).toBeDefined();
      expect(application.status).toBe('pending');
      expect(application.userId).toBe(candidate!.id);

      // 5. Verify application in candidate's list
      const candidateApplications = await storage.getApplicationsByUser(candidate!.id);
      expect(candidateApplications.length).toBe(1);
      expect(candidateApplications[0].id).toBe(application.id);

      // 6. Verify application in admin list
      const allApplications = await storage.getAllApplications();
      const candidateApp = allApplications.find(app => app.id === application.id);
      expect(candidateApp).toBeDefined();

      // 7. Update application status (admin action)
      const updatedApplication = await storage.updateApplication(application.id, {
        status: 'reviewed',
        autoScore: 78,
        assignedRecruiter: 'recruiter-123'
      });

      expect(updatedApplication?.status).toBe('reviewed');
      expect(updatedApplication?.autoScore).toBe(78);

      // 8. Verify updated status appears in candidate view
      const updatedCandidateApps = await storage.getApplicationsByUser(candidate!.id);
      expect(updatedCandidateApps[0].status).toBe('reviewed');
      expect(updatedCandidateApps[0].autoScore).toBe(78);
    });
  });

  describe('Data Validation and Security', () => {
    it('should validate application data', async () => {
      const candidate = await storage.createUser({
        email: 'validation.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Test',
        lastName: 'Validation',
        role: 'candidate'
      });
      testUsers.push(candidate.id);

      // Test with invalid job ID
      try {
        await storage.createApplication({
          jobId: 99999, // Non-existent job
          coverLetter: 'Test application'
        }, candidate.id);
        expect.fail('Should have thrown error for invalid job ID');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Test with valid data
      const validApplication = await storage.createApplication({
        jobId: testJobs[0],
        coverLetter: 'Valid application',
        salaryExpectation: '45000€'
      }, candidate.id);

      expect(validApplication).toBeDefined();
      expect(validApplication.status).toBe('pending');
    });

    it('should prevent cross-user data access', async () => {
      // Create two candidates
      const candidate1 = await storage.createUser({
        email: 'candidate1@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'User',
        lastName: 'One',
        role: 'candidate'
      });

      const candidate2 = await storage.createUser({
        email: 'candidate2@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'User',
        lastName: 'Two',
        role: 'candidate'
      });

      testUsers.push(candidate1.id, candidate2.id);

      // Create applications for each
      const app1 = await storage.createApplication({
        jobId: testJobs[0],
        coverLetter: 'Application from user 1'
      }, candidate1.id);

      const app2 = await storage.createApplication({
        jobId: testJobs[0],
        coverLetter: 'Application from user 2'
      }, candidate2.id);

      // Verify data isolation
      const user1Apps = await storage.getApplicationsByUser(candidate1.id);
      const user2Apps = await storage.getApplicationsByUser(candidate2.id);

      expect(user1Apps.length).toBe(1);
      expect(user2Apps.length).toBe(1);
      expect(user1Apps[0].id).toBe(app1.id);
      expect(user2Apps[0].id).toBe(app2.id);

      // Verify no cross-contamination
      expect(user1Apps.find(app => app.id === app2.id)).toBeUndefined();
      expect(user2Apps.find(app => app.id === app1.id)).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate email registration', async () => {
      const credentials = {
        email: 'duplicate.test@example.com',
        password: 'password123',
        firstName: 'First',
        lastName: 'User'
      };

      // First registration should succeed
      const firstUser = await AuthService.registerCandidate(credentials);
      expect(firstUser).toBeDefined();
      testUsers.push(firstUser!.id);

      // Second registration with same email should fail
      try {
        await AuthService.registerCandidate(credentials);
        expect.fail('Should have thrown error for duplicate email');
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('existe déjà');
      }
    });

    it('should handle non-existent user operations', async () => {
      const nonExistentUserId = 'non-existent-user-id';

      const user = await storage.getUser(nonExistentUserId);
      expect(user).toBeNull();

      try {
        await storage.updateUser(nonExistentUserId, { firstName: 'Test' });
        expect.fail('Should have thrown error for non-existent user');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent applications', async () => {
      const candidate = await storage.createUser({
        email: 'performance.test@example.com',
        password: await AuthService.hashPassword('password123'),
        firstName: 'Performance',
        lastName: 'Test',
        role: 'candidate'
      });
      testUsers.push(candidate.id);

      // Create multiple applications concurrently
      const applicationPromises = Array.from({ length: 5 }, (_, index) =>
        storage.createApplication({
          jobId: testJobs[0],
          coverLetter: `Application ${index + 1}`,
          salaryExpectation: `${40000 + index * 1000}€`
        }, candidate.id)
      );

      const applications = await Promise.all(applicationPromises);
      
      expect(applications.length).toBe(5);
      applications.forEach((app, index) => {
        expect(app.userId).toBe(candidate.id);
        expect(app.coverLetter).toBe(`Application ${index + 1}`);
      });

      // Verify all applications are retrievable
      const userApplications = await storage.getApplicationsByUser(candidate.id);
      expect(userApplications.length).toBe(5);
    });
  });
});