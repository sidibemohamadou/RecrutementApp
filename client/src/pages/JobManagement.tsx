import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  EyeOff, 
  Trash2,
  Briefcase,
  LogOut,
  Building2,
  MapPin,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function JobManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  // État pour la modal d'édition
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    contractType: "",
    experienceLevel: "",
    skills: [] as string[]
  });

  // État pour la modal de création
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    salary: "",
    contractType: "",
    experienceLevel: "",
    skills: [] as string[]
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/admin/jobs"],
  });

  const toggleJobMutation = useMutation({
    mutationFn: async ({ jobId, isActive }: { jobId: number, isActive: boolean }) => {
      // API call pour activer/désactiver une offre
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: "Succès",
        description: "L'offre d'emploi a été supprimée avec succès",
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

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, data }: { jobId: number, data: any }) => {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Succès",
        description: "L'offre d'emploi a été mise à jour avec succès",
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

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Erreur lors de la création');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: "",
        salary: "",
        contractType: "",
        experienceLevel: "",
        skills: []
      });
      toast({
        title: "Succès",
        description: "L'offre d'emploi a été créée avec succès",
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

  const filteredJobs = jobs.filter((job: any) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContractTypeColor = (contractType: string) => {
    switch (contractType) {
      case 'CDI':
        return 'bg-green-100 text-green-800';
      case 'CDD':
        return 'bg-blue-100 text-blue-800';
      case 'Freelance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleJob = (jobId: number, currentStatus: boolean) => {
    toggleJobMutation.mutate({ jobId, isActive: !currentStatus });
  };

  const handleDeleteJob = (jobId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      description: job.description || "",
      requirements: job.requirements || "",
      salary: job.salary || "",
      contractType: job.contractType || "",
      experienceLevel: job.experienceLevel || "",
      skills: job.skills || []
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = () => {
    if (!editingJob) return;
    
    const updateData = {
      ...editForm,
      skills: editForm.skills.filter(skill => skill.trim() !== '')
    };
    
    updateJobMutation.mutate({
      jobId: editingJob.id,
      data: updateData
    });
  };

  const handleCreateJob = () => {
    const jobData = {
      ...createForm,
      skills: createForm.skills.filter(skill => skill.trim() !== ""),
      isActive: true
    };
    
    createJobMutation.mutate(jobData);
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...editForm.skills];
    newSkills[index] = value;
    setEditForm({ ...editForm, skills: newSkills });
  };

  const addSkill = () => {
    setEditForm({ ...editForm, skills: [...editForm.skills, ""] });
  };

  const removeSkill = (index: number) => {
    const newSkills = editForm.skills.filter((_, i) => i !== index);
    setEditForm({ ...editForm, skills: newSkills });
  };

  const handleCreateSkillChange = (index: number, value: string) => {
    const newSkills = [...createForm.skills];
    newSkills[index] = value;
    setCreateForm({ ...createForm, skills: newSkills });
  };

  const addCreateSkill = () => {
    setCreateForm({ ...createForm, skills: [...createForm.skills, ""] });
  };

  const removeCreateSkill = (index: number) => {
    const newSkills = createForm.skills.filter((_, i) => i !== index);
    setCreateForm({ ...createForm, skills: newSkills });
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
          <Button variant="ghost" className="border-b-2 border-primary text-primary">
            <Briefcase className="h-4 w-4 mr-2" />
            Offres d'emploi
          </Button>
          <Link href="/admin/applications">
            <Button variant="ghost" className="text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2" />
              Candidatures
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin/users">
              <Button variant="ghost" className="text-muted-foreground">
                <Briefcase className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
            </Link>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Offres d'Emploi</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground" data-testid="button-new-job">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Offre
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        {job.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Publiée
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Masquée
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {job.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr }) : ''}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center space-x-2">
                        <Badge className={getContractTypeColor(job.contractType)}>
                          {job.contractType}
                        </Badge>
                        {job.experienceLevel && (
                          <Badge variant="outline">
                            {job.experienceLevel}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground ml-4">
                          {job.applicationsCount || 0} candidature(s)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditJob(job)}
                        data-testid={`button-edit-job-${job.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleJob(job.id, job.isActive)}
                        data-testid={`button-toggle-job-${job.id}`}
                      >
                        {job.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-job-${job.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune offre d'emploi trouvée
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'offre d'emploi</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Titre du poste</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Entreprise</Label>
                <Input
                  id="edit-company"
                  value={editForm.company}
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  placeholder="Ex: TechCorp"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Localisation</Label>
                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Ex: Paris, France"
                />
              </div>
              <div>
                <Label htmlFor="edit-salary">Salaire</Label>
                <Input
                  id="edit-salary"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  placeholder="Ex: 45k - 60k €"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Description du poste..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-requirements">Exigences</Label>
              <Textarea
                id="edit-requirements"
                value={editForm.requirements}
                onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                placeholder="Exigences et qualifications..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de contrat</Label>
                <Select 
                  value={editForm.contractType} 
                  onValueChange={(value) => setEditForm({ ...editForm, contractType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Niveau d'expérience</Label>
                <Select 
                  value={editForm.experienceLevel} 
                  onValueChange={(value) => setEditForm({ ...editForm, experienceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Compétences</Label>
              <div className="space-y-2">
                {editForm.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder="Ex: React, Node.js..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSkill}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une compétence
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdateJob}
                disabled={updateJobMutation.isPending}
                data-testid="button-save-job"
              >
                {updateJobMutation.isPending ? 'Mise à jour...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de création d'offre */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle offre d'emploi</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-title">Titre du poste *</Label>
                <Input
                  id="create-title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>
              <div>
                <Label htmlFor="create-company">Entreprise *</Label>
                <Input
                  id="create-company"
                  value={createForm.company}
                  onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                  placeholder="Ex: AeroTech Solutions"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-location">Localisation *</Label>
                <Input
                  id="create-location"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  placeholder="Ex: Paris, France"
                />
              </div>
              <div>
                <Label htmlFor="create-salary">Salaire</Label>
                <Input
                  id="create-salary"
                  value={createForm.salary}
                  onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })}
                  placeholder="Ex: 45000-60000€"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-contract">Type de contrat *</Label>
                <Select value={createForm.contractType} onValueChange={(value) => setCreateForm({ ...createForm, contractType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Apprentissage">Apprentissage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-experience">Niveau d'expérience</Label>
                <Select value={createForm.experienceLevel} onValueChange={(value) => setCreateForm({ ...createForm, experienceLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="create-description">Description du poste *</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Décrivez le poste en détail..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="create-requirements">Exigences et qualifications</Label>
              <Textarea
                id="create-requirements"
                value={createForm.requirements}
                onChange={(e) => setCreateForm({ ...createForm, requirements: e.target.value })}
                placeholder="Compétences requises, diplômes, expérience..."
                rows={3}
              />
            </div>

            <div>
              <Label>Compétences techniques</Label>
              <div className="space-y-2">
                {createForm.skills.map((skill, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={skill}
                      onChange={(e) => handleCreateSkillChange(index, e.target.value)}
                      placeholder="Ex: React.js"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeCreateSkill(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCreateSkill}
                >
                  + Ajouter une compétence
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateJob}
                disabled={createJobMutation.isPending || !createForm.title || !createForm.company || !createForm.location || !createForm.description || !createForm.contractType}
                data-testid="button-create-job"
              >
                {createJobMutation.isPending ? 'Création...' : 'Créer l\'offre'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}