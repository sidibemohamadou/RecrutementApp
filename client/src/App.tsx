import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "@/pages/Landing";
import CandidateLogin from "@/pages/CandidateLogin";
import AdminLogin from "@/pages/AdminLogin";
import CandidateDashboard from "@/pages/CandidateDashboard";
import Profile from "@/pages/Profile";
import Applications from "@/pages/Applications";
import AdminDashboard from "@/pages/AdminDashboard";
import JobManagement from "@/pages/JobManagement";
import ApplicationManagement from "@/pages/ApplicationManagement";
import CandidateAssignment from "@/pages/CandidateAssignment";
import CandidateScoring from "@/pages/CandidateScoring";
import FinalResults from "@/pages/FinalResults";
import ProfileCompletion from "@/pages/ProfileCompletion";
import ContractManagement from "@/pages/ContractManagement";
import HRManagement from "@/pages/HRManagement";
import HRDashboard from "@/pages/HRDashboard";
import HRLeaveManagement from "@/pages/HRLeaveManagement";
import HRBenefitsManagement from "@/pages/HRBenefitsManagement";
import UserManagement from "@/pages/UserManagement";
import PayrollManagement from "@/pages/PayrollManagement";
import OnboardingManagement from "@/pages/OnboardingManagement";
import CandidateOnboarding from "@/pages/CandidateOnboarding";
import OnboardingFeedback from "@/pages/OnboardingFeedback";
import AchievementsPage from "@/pages/AchievementsPage";
import OnboardingCalendar from "@/pages/OnboardingCalendar";
import InterviewManagement from "@/pages/InterviewManagement";
import EmployeeManagement from "@/pages/EmployeeManagement";
import CandidateInvitations from "@/pages/CandidateInvitations";
import CandidateInvitationHandler from "@/pages/CandidateInvitationHandler";
import AdminProfile from "@/pages/AdminProfile";
import NotFound from "@/pages/not-found";

// Système de notification simple (remplace Toaster)
function SimpleNotification({ message, type = "info" }: { message?: string; type?: "info" | "success" | "error" }) {
  if (!message) return null;
  
  const colors = {
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
    success: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828' }
  };
  
  const style = colors[type];
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem',
      backgroundColor: style.bg,
      border: `2px solid ${style.border}`,
      borderRadius: '8px',
      color: style.text,
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      {message}
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Chargement...
      </div>
    );
  }

  try {

    return (
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/candidate-login" component={CandidateLogin} />
            <Route path="/login" component={CandidateLogin} />
            <Route path="/admin-login" component={AdminLogin} />
            <Route path="/candidate-invitation/:token" component={CandidateInvitationHandler} />
          </>
        ) : (
          <>
            {/* Routes pour candidats */}
            {(user as any)?.role === "candidate" && (
              <>
                {/* Redirection vers ProfileCompletion si profil non complété */}
                {!(user as any)?.profileCompleted ? (
                  <>
                    <Route path="/" component={ProfileCompletion} />
                    <Route path="/profile-completion" component={ProfileCompletion} />
                  </>
                ) : (
                  <>
                    <Route path="/" component={CandidateDashboard} />
                    <Route path="/profile" component={Profile} />
                    <Route path="/applications" component={Applications} />
                    <Route path="/jobs" component={Landing} />
                    <Route path="/candidate-onboarding" component={CandidateOnboarding} />
                    <Route path="/onboarding-feedback" component={OnboardingFeedback} />
                    <Route path="/achievements" component={AchievementsPage} />
                    <Route path="/onboarding-calendar" component={OnboardingCalendar} />
                  </>
                )}
              </>
            )}
            
            {/* Routes pour recruteurs, RH et admins */}
            {((user as any)?.role === "recruiter" || (user as any)?.role === "hr" || (user as any)?.role === "admin") && (
              <>
                <Route path="/" component={AdminDashboard} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/jobs" component={JobManagement} />
                <Route path="/admin/applications" component={ApplicationManagement} />
                <Route path="/admin/assignment" component={CandidateAssignment} />
                <Route path="/admin/scoring" component={CandidateScoring} />
                <Route path="/admin/final-results" component={FinalResults} />
                <Route path="/contracts" component={ContractManagement} />
                <Route path="/hr" component={HRDashboard} />
                <Route path="/hr/management" component={HRManagement} />
                <Route path="/hr/leaves" component={HRLeaveManagement} />
                <Route path="/hr/benefits" component={HRBenefitsManagement} />
                <Route path="/hr/payroll" component={PayrollManagement} />
                <Route path="/admin/payroll" component={PayrollManagement} />
                <Route path="/admin/onboarding" component={OnboardingManagement} />
                <Route path="/admin/interviews" component={InterviewManagement} />
                <Route path="/admin/employees" component={EmployeeManagement} />
                <Route path="/admin/invitations" component={CandidateInvitations} />
                <Route path="/admin/profile" component={AdminProfile} />
                {(user as any)?.role === "admin" && (
                  <Route path="/admin/users" component={UserManagement} />
                )}
              </>
            )}
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    );
  } catch (error) {
    console.error('Router error:', error);
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Erreur de chargement</div>;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div id="simple-notifications"></div>
        <Router />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
