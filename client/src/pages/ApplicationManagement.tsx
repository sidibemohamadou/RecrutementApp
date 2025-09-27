import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Eye, 
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Briefcase,
  LogOut,
  Edit,
  Trash2,
  X,
  Plus
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function ApplicationManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  
  // État pour la modal d'édition
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    assignedRecruiter: "",
    manualScore: "",
    scoreNotes: ""
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/admin/applications"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number, status: string }) => {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({
        title: "Succès",
        description: "Le statut de la candidature a été mis à jour",
      });
    }
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, data }: { applicationId: number, data: any }) => {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erreur lors de la mise à jour');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Succès",
        description: "La candidature a été mise à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({
        title: "Succès",
        description: "La candidature a été supprimée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const filteredApplications = applications.filter((app: any) => {
    const matchesSearch = 
      app.candidate?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800", 
      interview: "bg-purple-100 text-purple-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "En attente",
      reviewed: "Examinée",
      interview: "Entretien",
      accepted: "Acceptée", 
      rejected: "Refusée"
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleStatusChange = (applicationId: number, newStatus: string) => {
    updateStatusMutation.mutate({ applicationId, status: newStatus });
  };

  const handleEditApplication = (application: any) => {
    setEditingApplication(application);
    setEditForm({
      status: application.status || "",
      assignedRecruiter: application.assignedRecruiter || "",
      manualScore: application.manualScore?.toString() || "",
      scoreNotes: application.scoreNotes || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateApplication = () => {
    if (!editingApplication) return;
    
    const updateData = {
      ...editForm,
      manualScore: editForm.manualScore ? parseInt(editForm.manualScore) : null
    };
    
    updateApplicationMutation.mutate({
      applicationId: editingApplication.id,
      data: updateData
    });
  };

  const handleDeleteApplication = (applicationId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      deleteApplicationMutation.mutate(applicationId);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Admin RH</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/admin/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </span>
              <Badge variant="secondary">
                {user?.role === "admin" ? "Super Admin" : 
                 user?.role === "hr" ? "RH" : "Recruteur"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex space-x-6 mb-8 border-b border-border">
          <Link href="/admin">
            <Button variant="ghost" className="text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2" />
              Tableau de bord
            </Button>
          </Link>
          <Link href="/admin/jobs">
            <Button variant="ghost" className="text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2" />
              Offres d'emploi
            </Button>
          </Link>
          <Button variant="ghost" className="border-b-2 border-primary text-primary">
            <FileText className="h-4 w-4 mr-2" />
            Candidatures
          </Button>
          {user?.role === "admin" && (
            <Link href="/admin/users">
              <Button variant="ghost" className="text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
            </Link>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-6">Gestion des Candidatures</h1>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom de candidat ou poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="reviewed">Examinées</SelectItem>
              <SelectItem value="interview">Entretiens</SelectItem>
              <SelectItem value="accepted">Acceptées</SelectItem>
              <SelectItem value="rejected">Refusées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application: any) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {application.candidate?.firstName} {application.candidate?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Candidature pour: <span className="font-medium">{application.job?.title}</span>
                          </p>
                        </div>
                        <Badge className={getStatusBadge(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{application.candidate?.email || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{application.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {application.createdAt ? 
                              formatDistanceToNow(new Date(application.createdAt), { addSuffix: true, locale: fr }) :
                              'Date inconnue'
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Disponible: {application.availabilityDate ? 
                              new Date(application.availabilityDate).toLocaleDateString('fr-FR') :
                              'Immédiatement'
                            }
                          </span>
                        </div>
                      </div>

                      {application.coverLetter && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Lettre de motivation:</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        {application.cvPath && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            CV
                          </Button>
                        )}
                        {application.motivationLetterPath && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Lettre
                          </Button>
                        )}
                        {application.salaryExpectation && (
                          <span className="text-sm text-muted-foreground">
                            Salaire: {application.salaryExpectation}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-6">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditApplication(app)}
                          data-testid={`button-edit-application-${app.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-application-${app.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Select 
                        value={app.status} 
                        onValueChange={(value) => handleStatusChange(app.id, value)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="reviewed">Examinée</SelectItem>
                          <SelectItem value="interview">Entretien</SelectItem>
                          <SelectItem value="accepted">Acceptée</SelectItem>
                          <SelectItem value="rejected">Refusée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune candidature trouvée
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la candidature</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Statut</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="reviewed">Examinée</SelectItem>
                    <SelectItem value="interview">Entretien</SelectItem>
                    <SelectItem value="accepted">Acceptée</SelectItem>
                    <SelectItem value="rejected">Refusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-recruiter">Recruteur assigné</Label>
                <Input
                  id="edit-recruiter"
                  value={editForm.assignedRecruiter}
                  onChange={(e) => setEditForm({ ...editForm, assignedRecruiter: e.target.value })}
                  placeholder="ID du recruteur"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-score">Note manuelle (0-100)</Label>
              <Input
                id="edit-score"
                type="number"
                min="0"
                max="100"
                value={editForm.manualScore}
                onChange={(e) => setEditForm({ ...editForm, manualScore: e.target.value })}
                placeholder="Score de 0 à 100"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes du recruteur</Label>
              <Textarea
                id="edit-notes"
                value={editForm.scoreNotes}
                onChange={(e) => setEditForm({ ...editForm, scoreNotes: e.target.value })}
                placeholder="Commentaires et observations..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdateApplication}
                disabled={updateApplicationMutation.isPending}
                data-testid="button-save-application"
              >
                {updateApplicationMutation.isPending ? 'Mise à jour...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}