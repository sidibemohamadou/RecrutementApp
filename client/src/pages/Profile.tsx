import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, 
  Bell, 
  User, 
  ChevronDown, 
  LayoutDashboard,
  FileText,
  Search,
  Folder,
  Save,
  Upload
} from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    maritalStatus: "",
    address: "",
    residencePlace: "",
    idDocumentType: "",
    idDocumentNumber: "",
    birthDate: "",
    birthPlace: "",
    birthCountry: "",
    nationality: "",
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du profil",
        variant: "destructive",
      });
    }
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

    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        maritalStatus: profile.maritalStatus || "",
        address: profile.address || "",
        residencePlace: profile.residencePlace || "",
        idDocumentType: profile.idDocumentType || "",
        idDocumentNumber: profile.idDocumentNumber || "",
        birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : "",
        birthPlace: profile.birthPlace || "",
        birthCountry: profile.birthCountry || "",
        nationality: profile.nationality || "",
      });
    }
  }, [isAuthenticated, isLoading, toast, profile]);

  if (isLoading || profileLoading) {
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : null
    };
    
    updateProfileMutation.mutate(updateData);
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
              
            {/* Address Information */}
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                <CardTitle>Adresse et résidence</CardTitle>
                </span>
              </Button>
              
                  <Label htmlFor="address">Adresse complète</Label>
                <div className="h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse complète (rue, quartier, ville...)"
                    rows={3}
                    data-testid="textarea-profile-address"
                      <SelectTrigger data-testid="select-profile-gender">
                        <SelectValue placeholder="Sélectionnez votre sexe" />
                      </SelectTrigger>
                  <Label htmlFor="residencePlace">Lieu de résidence</Label>
                  <Input
                    id="residencePlace"
                    value={formData.residencePlace}
                    onChange={(e) => setFormData(prev => ({ ...prev, residencePlace: e.target.value }))}
                    placeholder="Ex: Dakar, Thiès, Saint-Louis..."
                    data-testid="input-profile-residence"
                    <Label htmlFor="maritalStatus">Situation matrimoniale</Label>
                    <Select value={formData.maritalStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}>
              </CardContent>
            </Card>

            {/* Identity Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pièce d'identité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idDocumentType">Type de pièce</Label>
                    <Select value={formData.idDocumentType} onValueChange={(value) => setFormData(prev => ({ ...prev, idDocumentType: value }))}>
                      <SelectTrigger data-testid="select-profile-id-type">
                        <SelectValue placeholder="Type de pièce" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNI">Carte Nationale d'Identité</SelectItem>
                        <SelectItem value="Passeport">Passeport</SelectItem>
                        <SelectItem value="Permis de séjour">Permis de séjour</SelectItem>
                        <SelectItem value="Carte consulaire">Carte consulaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="idDocumentNumber">Numéro d'identification</Label>
                    <Input
                      id="idDocumentNumber"
                      value={formData.idDocumentNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, idDocumentNumber: e.target.value }))}
                      placeholder="Numéro de votre pièce d'identité"
                      data-testid="input-profile-id-number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
                      <SelectTrigger data-testid="select-profile-marital-status">
            {/* Birth Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de naissance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                        <SelectValue placeholder="Sélectionnez votre situation" />
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    data-testid="input-profile-birth-date"
                    </Select>
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthPlace">Lieu de naissance</Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
                      placeholder="Ville ou lieu de naissance"
                      data-testid="input-profile-birth-place"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthCountry">Pays de naissance</Label>
                    <Input
                      id="birthCountry"
                      value={formData.birthCountry}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthCountry: e.target.value }))}
                      placeholder="Pays de naissance"
                      data-testid="input-profile-birth-country"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="Votre nationalité"
                    data-testid="input-profile-nationality"
                  />
                </div>
                </div>
                <span className="text-sm font-medium" data-testid="text-user-name">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                disabled={updateProfileMutation.isPending}
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  <ChevronDown className="h-4 w-4" />
                <span>{updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}</span>
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
                <Link href="/applications">
                  <a className="flex items-center space-x-3 p-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" data-testid="link-applications">
                    <FileText className="h-5 w-5" />
                    <span>Mes candidatures</span>
                  </a>
                </Link>
              </li>
              <li>
                <a href="#profile" className="flex items-center space-x-3 p-3 text-primary bg-primary/10 rounded-md">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Mon profil</span>
                </a>
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-profile-title">
              Mon profil
            </h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et professionnelles
            </p>
          </div>
          
          <div className="max-w-2xl">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        data-testid="input-profile-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        data-testid="input-profile-last-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      data-testid="input-profile-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+33 1 23 45 67 89"
                      data-testid="input-profile-phone"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Présentation</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Décrivez brièvement votre parcours et vos objectifs professionnels..."
                      rows={4}
                      data-testid="textarea-profile-bio"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Expérience professionnelle</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="Décrivez vos expériences professionnelles..."
                      rows={6}
                      data-testid="textarea-profile-experience"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Compétences</Label>
                    <Textarea
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="Listez vos compétences principales (séparées par des virgules)..."
                      rows={3}
                      data-testid="textarea-profile-skills"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="flex items-center space-x-2"
                  data-testid="button-save-profile"
                >
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
