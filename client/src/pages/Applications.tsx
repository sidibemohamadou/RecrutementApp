import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Building2,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";
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

export default function Applications() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const currentLang = getLanguage();
  const locale = locales[currentLang];

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
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
    const translations = {
      pending: "En attente",
      reviewed: "Examinée", 
      interview: "Entretien planifié",
      accepted: "Acceptée",
      rejected: "Refusée",
    };
    return translations[status as keyof typeof translations] || status;
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
              
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
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
                  <a className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Tableau de bord</span>
                  </a>
                </Link>
              </li>
              <li>
                <a href="#applications" className="flex items-center space-x-3 p-3 text-primary bg-primary/10 rounded-md">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">Mes candidatures</span>
                </a>
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-applications-title">
              Mes candidatures
            </h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos candidatures et gérez votre parcours professionnel
            </p>
          </div>
          
          {applicationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Aucune candidature</h3>
                <p className="text-muted-foreground mb-4" data-testid="text-no-applications">
                  Vous n'avez pas encore envoyé de candidature. Découvrez nos offres d'emploi !
                </p>
                <Link href="/jobs">
                  <Button data-testid="button-browse-jobs">
                    Parcourir les offres
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card 
                  key={application.id}
                  className="hover:shadow-md transition-shadow"
                  data-testid={`card-application-${application.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-job-title-${application.id}`}>
                          {application.job?.title || 'Poste supprimé'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            <span data-testid={`text-company-${application.id}`}>{application.job?.company || 'Entreprise inconnue'}</span>
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span data-testid={`text-location-${application.id}`}>{application.job?.location || 'Location inconnue'}</span>
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span data-testid={`text-applied-date-${application.id}`}>
                              Candidature envoyée {formatDistanceToNow(application.createdAt, { addSuffix: true, locale })}
                            </span>
                          </span>
                        </div>
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
                    
                    {application.coverLetter && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-cover-letter-${application.id}`}>
                          {application.coverLetter}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {application.salaryExpectation && (
                          <span data-testid={`text-salary-expectation-${application.id}`}>
                            Prétentions: {application.salaryExpectation}
                          </span>
                        )}
                        {application.availability && (
                          <span data-testid={`text-availability-${application.id}`}>
                            Disponible: {new Date(application.availability).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-2"
                        data-testid={`button-view-application-${application.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Voir détails</span>
                      </Button>
                    </div>
                    
                    {/* Timeline de suivi pour chaque candidature */}
                    <div className="border-t pt-6">
                      <ApplicationTimeline application={application} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
