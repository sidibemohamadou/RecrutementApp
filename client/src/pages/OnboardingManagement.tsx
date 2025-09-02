import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  UserCheck,
  Plane,
  Settings,
  FileText,
  Calendar
} from "lucide-react";

interface OnboardingProcess {
  id: number;
  name: string;
  description: string;
  department: string;
  isActive: boolean;
  estimatedDuration: number;
  createdAt: string;
}

interface OnboardingStep {
  id: number;
  processId: number;
  stepNumber: number;
  title: string;
  description: string;
  category: string;
  isRequired: boolean;
  estimatedDuration: number;
  assignedRole: string;
}

interface CandidateOnboarding {
  id: number;
  userId: string;
  processId: number;
  status: string;
  progress: number;
  startDate: string;
  expectedCompletionDate: string;
  assignedMentor: string;
  notes: string;
}

export default function OnboardingManagement() {
  const [newProcessOpen, setNewProcessOpen] = useState(false);
  const [newStepOpen, setNewStepOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
  const [newCandidateOpen, setNewCandidateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch onboarding processes
  const { data: processes = [], isLoading: processesLoading } = useQuery({
    queryKey: ["/api/onboarding/processes"],
  });

  // Fetch all users for candidate selection
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Create process mutation
  const createProcessMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/onboarding/processes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/processes"] });
      setNewProcessOpen(false);
      toast({
        title: "Processus créé",
        description: "Le processus d'onboarding a été créé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du processus.",
        variant: "destructive",
      });
    },
  });

  // Create step mutation
  const createStepMutation = useMutation({
    mutationFn: async ({ processId, data }: { processId: number; data: any }) => 
      apiRequest("POST", `/api/onboarding/processes/${processId}/steps`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/processes"] });
      setNewStepOpen(false);
      toast({
        title: "Étape créée",
        description: "L'étape d'onboarding a été créée avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'étape.",
        variant: "destructive",
      });
    },
  });

  // Create candidate onboarding mutation
  const createCandidateOnboardingMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/onboarding/candidates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding/candidates"] });
      setNewCandidateOpen(false);
      toast({
        title: "Onboarding démarré",
        description: "L'onboarding du candidat a été démarré avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Erreur lors du démarrage de l'onboarding.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProcess = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const processData = {
      name: formData.get("name"),
      description: formData.get("description"),
      department: formData.get("department"),
      estimatedDuration: parseInt(formData.get("estimatedDuration") as string),
    };
    
    createProcessMutation.mutate(processData);
  };

  const handleCreateStep = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProcess) return;
    
    const formData = new FormData(event.currentTarget);
    
    const stepData = {
      stepNumber: parseInt(formData.get("stepNumber") as string),
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      isRequired: formData.get("isRequired") === "true",
      estimatedDuration: parseInt(formData.get("estimatedDuration") as string),
      assignedRole: formData.get("assignedRole"),
    };
    
    createStepMutation.mutate({ processId: selectedProcess, data: stepData });
  };

  const handleCreateCandidateOnboarding = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const onboardingData = {
      userId: formData.get("userId"),
      processId: parseInt(formData.get("processId") as string),
      startDate: formData.get("startDate"),
      expectedCompletionDate: formData.get("expectedCompletionDate"),
      assignedMentor: formData.get("assignedMentor"),
      notes: formData.get("notes"),
    };
    
    createCandidateOnboardingMutation.mutate(onboardingData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department?.toLowerCase()) {
      case 'aviation': return <Plane className="h-4 w-4" />;
      case 'sécurité': return <AlertCircle className="h-4 w-4" />;
      case 'administration': return <FileText className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (processesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestion de l'Onboarding</h1>
                <p className="text-muted-foreground">Gérez les processus d'intégration des nouveaux employés</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Dialog open={newProcessOpen} onOpenChange={setNewProcessOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Processus
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer un Processus d'Onboarding</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProcess} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom du processus</Label>
                      <Input id="name" name="name" placeholder="Ex: Onboarding Personnel Aviation" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Description du processus d'onboarding..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">Département</Label>
                        <Select name="department" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un département" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aviation">Aviation</SelectItem>
                            <SelectItem value="Sécurité">Sécurité</SelectItem>
                            <SelectItem value="Administration">Administration</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="estimatedDuration">Durée estimée (jours)</Label>
                        <Input id="estimatedDuration" name="estimatedDuration" type="number" placeholder="30" required />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setNewProcessOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={createProcessMutation.isPending}>
                        {createProcessMutation.isPending ? "Création..." : "Créer"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={newCandidateOpen} onOpenChange={setNewCandidateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Démarrer Onboarding
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Démarrer l'Onboarding d'un Candidat</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCandidateOnboarding} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userId">Candidat</Label>
                        <Select name="userId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un candidat" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter((user: any) => user.role === 'candidate').map((user: any) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="processId">Processus</Label>
                        <Select name="processId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un processus" />
                          </SelectTrigger>
                          <SelectContent>
                            {processes.map((process: OnboardingProcess) => (
                              <SelectItem key={process.id} value={process.id.toString()}>
                                {process.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Date de début</Label>
                        <Input id="startDate" name="startDate" type="date" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="expectedCompletionDate">Date de fin prévue</Label>
                        <Input id="expectedCompletionDate" name="expectedCompletionDate" type="date" required />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="assignedMentor">Mentor assigné</Label>
                      <Select name="assignedMentor">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un mentor" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.filter((user: any) => user.role === 'hr' || user.role === 'admin').map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" placeholder="Notes sur l'onboarding..." />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setNewCandidateOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={createCandidateOnboardingMutation.isPending}>
                        {createCandidateOnboardingMutation.isPending ? "Démarrage..." : "Démarrer"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="processes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="processes">Processus d'Onboarding</TabsTrigger>
            <TabsTrigger value="candidates">Candidats en Onboarding</TabsTrigger>
          </TabsList>

          <TabsContent value="processes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processes.map((process: OnboardingProcess) => (
                <Card key={process.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDepartmentIcon(process.department)}
                        <CardTitle className="text-lg">{process.name}</CardTitle>
                      </div>
                      <Badge variant={process.isActive ? "default" : "secondary"}>
                        {process.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{process.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{process.estimatedDuration} jours</span>
                      </div>
                      <Badge variant="outline">{process.department}</Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog open={newStepOpen && selectedProcess === process.id} onOpenChange={(open) => {
                        setNewStepOpen(open);
                        if (open) setSelectedProcess(process.id);
                        else setSelectedProcess(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter Étape
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ajouter une Étape</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateStep} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="stepNumber">Numéro d'étape</Label>
                                <Input id="stepNumber" name="stepNumber" type="number" required />
                              </div>
                              
                              <div>
                                <Label htmlFor="category">Catégorie</Label>
                                <Select name="category" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Catégorie" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="documentation">Documentation</SelectItem>
                                    <SelectItem value="formation">Formation</SelectItem>
                                    <SelectItem value="administrative">Administrative</SelectItem>
                                    <SelectItem value="technique">Technique</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="title">Titre de l'étape</Label>
                              <Input id="title" name="title" placeholder="Ex: Formation Sécurité Aéroport" required />
                            </div>
                            
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea id="description" name="description" placeholder="Description de l'étape..." />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="estimatedDuration">Durée (heures)</Label>
                                <Input id="estimatedDuration" name="estimatedDuration" type="number" required />
                              </div>
                              
                              <div>
                                <Label htmlFor="assignedRole">Rôle assigné</Label>
                                <Select name="assignedRole" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Rôle" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="hr">RH</SelectItem>
                                    <SelectItem value="security">Sécurité</SelectItem>
                                    <SelectItem value="supervisor">Superviseur</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="isRequired">Étape obligatoire</Label>
                              <Select name="isRequired" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Obligatoire ?" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Oui</SelectItem>
                                  <SelectItem value="false">Non</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setNewStepOpen(false)}>
                                Annuler
                              </Button>
                              <Button type="submit" disabled={createStepMutation.isPending}>
                                {createStepMutation.isPending ? "Création..." : "Créer"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidats en Cours d'Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cette section affichera tous les candidats actuellement en processus d'onboarding avec leur progression.
                </p>
                <div className="mt-4 text-center">
                  <Button onClick={() => setNewCandidateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Démarrer un Onboarding
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}