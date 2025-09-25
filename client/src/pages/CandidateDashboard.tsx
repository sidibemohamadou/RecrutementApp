import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard,
  FileText,
  Search,
  Folder,
  Send,
  Clock,
  Calendar,
  UserCheck,
  CheckCircle,
  Circle
} from "lucide-react";
import { t } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, pt } from "date-fns/locale";
import { getLanguage } from "@/lib/i18n";
import { ApplicationTimeline } from "@/components/ApplicationTimeline";

const locales = {
  fr: fr,
  en: enUS,
  pt: pt,
};

export default function CandidateDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const currentLang = getLanguage();
  const locale = locales[currentLang];

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated,
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez être connecté. Redirection vers la connexion...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const stats = {
    applicationsCount: applications.length,
    pendingCount: applications.filter(app => app.status === 'pending').length,
    interviewsCount: applications.filter(app => app.status === 'interview').length,
    profileCompletion: profile?.profileCompleted ? 100 : 50,
  };

  const recentApplications = applications.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'interview':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    return t(`status_${status}` as any) || status;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-foreground">JobPortal</span>
                <span className="text-sm text-muted-foreground">Espace candidat</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </div>
                <span className="text-sm font-medium" data-testid="text-user-name">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => import("@/lib/logout").then(m => m.handleLogout())}
                  data-testid="button-logout"
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-card shadow-sm border-r border-border min-h-screen">
          <div className="p-6">
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="flex items-center space-x-3 p-3 text-primary bg-primary/10 rounded-md">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">{t('dashboard')}</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/applications">
                  <a className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-applications">
                    <FileText className="h-5 w-5" />
                    <span>Mes candidatures</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/profile">
                  <a className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-profile">
                    <User className="h-5 w-5" />
                    <span>Mon profil</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/onboarding">
                  <a className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-onboarding">
                    <UserCheck className="h-5 w-5" />
                    <span>Mon onboarding</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/jobs">
                  <a className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-search">
                    <Search className="h-5 w-5" />
                    <span>Rechercher</span>
                  </a>
                </Link>
              </li>
              <li>
                <a href="#documents" className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-documents">
                  <Folder className="h-5 w-5" />
                  <span>Mes documents</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 p-8 bg-background">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
              {t('dashboard')}
            </h1>
            <p className="text-muted-foreground" data-testid="text-welcome-message">
              {t('welcome')}
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('applications_sent')}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-applications-count">
                      {stats.applicationsCount}
                    </p>
                  </div>
                  <Send className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('pending')}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-count">
                      {stats.pendingCount}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('interviews')}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-interviews-count">
                      {stats.interviewsCount}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('profile_completed')}</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-profile-completion">
                      {stats.profileCompletion}%
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de candidature principale */}
          {recentApplications.length > 0 && (
            <div className="mb-8">
              <ApplicationTimeline application={recentApplications[0]} />
            </div>
          )}
          
          {/* Recent Applications and Profile Completion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {t('recent_applications')}
                </h3>
                {applicationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-4 bg-background rounded-lg">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentApplications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-applications">
                    Aucune candidature envoyée pour le moment.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div 
                        key={application.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg"
                        data-testid={`application-item-${application.id}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground" data-testid={`text-job-title-${application.id}`}>
                            {application.job?.title || 'Poste supprimé'}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-company-${application.id}`}>
                            {application.job?.company || 'Entreprise inconnue'}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-date-${application.id}`}>
                            Candidature envoyée {formatDistanceToNow(application.createdAt, { addSuffix: true, locale })}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={getStatusColor(application.status)}
                            data-testid={`badge-status-${application.id}`}
                          >
                            {getStatusText(application.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/applications">
                    <a className="text-primary hover:text-primary/80 text-sm font-medium" data-testid="link-view-all-applications">
                      Voir toutes mes candidatures →
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Profile Completion */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Complétez votre profil
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Informations personnelles</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Email vérifié</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Photo de profil</span>
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Expériences professionnelles</span>
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Compétences</span>
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/profile">
                    <Button className="w-full" data-testid="button-complete-profile">
                      Compléter mon profil
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    case 'reviewed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'interview':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
}

function getStatusText(status: string) {
  const translations = {
    pending: "En attente",
    reviewed: "Examinée", 
    interview: "Entretien planifié",
    accepted: "Acceptée",
    rejected: "Refusée",
  };
  return translations[status as keyof typeof translations] || status;
}
