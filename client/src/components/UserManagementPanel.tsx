import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  User,
  Crown,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface UserPermissions {
  canCreateUsers: boolean;
  canManageRoles: string[];
  canViewUsers: string[];
  canEditUsers: string[];
  canDeleteUsers: boolean;
  accessibleModules: string[];
}

interface CreateUserForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  department: string;
}

interface EditUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
}

export function UserManagementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    department: ""
  });

  const [editForm, setEditForm] = useState<EditUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: ""
  });

  // Fetch user permissions
  const { data: permissions } = useQuery({
    queryKey: ["/api/users/permissions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users/permissions");
      return response.json();
    },
  });

  // Fetch available roles
  const { data: availableRoles = [] } = useQuery({
    queryKey: ["/api/users/available-roles"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users/available-roles");
      return response.json();
    },
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setCreateDialogOpen(false);
      resetCreateForm();
      toast({
        title: "Utilisateur créé",
        description: "Le nouvel utilisateur a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditUserForm }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Utilisateur modifié",
        description: "Les informations ont été mises à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const resetCreateForm = () => {
    setCreateForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
      phone: "",
      department: ""
    });
  };

  const handleEdit = (userToEdit: any) => {
    setSelectedUser(userToEdit);
    setEditForm({
      firstName: userToEdit.firstName || "",
      lastName: userToEdit.lastName || "",
      email: userToEdit.email || "",
      phone: userToEdit.phone || "",
      role: userToEdit.role || "",
      department: userToEdit.department || ""
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (userToDelete: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.firstName} ${userToDelete.lastName} ?`)) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12) + "A1!";
    setCreateForm({ ...createForm, password });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { variant: any; label: string; icon: JSX.Element; color: string }> = {
      admin: { 
        variant: "destructive", 
        label: "Super Admin", 
        icon: <Crown className="w-3 h-3" />,
        color: "bg-red-100 text-red-800"
      },
      hr: { 
        variant: "default", 
        label: "RH", 
        icon: <Users className="w-3 h-3" />,
        color: "bg-blue-100 text-blue-800"
      },
      recruiter: { 
        variant: "secondary", 
        label: "Recruteur", 
        icon: <UserPlus className="w-3 h-3" />,
        color: "bg-green-100 text-green-800"
      },
      manager: { 
        variant: "outline", 
        label: "Manager", 
        icon: <Briefcase className="w-3 h-3" />,
        color: "bg-purple-100 text-purple-800"
      },
      employee: { 
        variant: "outline", 
        label: "Employé", 
        icon: <User className="w-3 h-3" />,
        color: "bg-gray-100 text-gray-800"
      },
      candidate: { 
        variant: "outline", 
        label: "Candidat", 
        icon: <Mail className="w-3 h-3" />,
        color: "bg-yellow-100 text-yellow-800"
      },
    };
    
    const config = roleConfig[role] || roleConfig.candidate;
    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const filteredUsers = users.filter((userItem: any) => 
    roleFilter === "all" || userItem.role === roleFilter
  );

  const userStats = {
    total: users.length,
    admins: users.filter((u: any) => u.role === "admin").length,
    hr: users.filter((u: any) => u.role === "hr").length,
    recruiters: users.filter((u: any) => u.role === "recruiter").length,
    candidates: users.filter((u: any) => u.role === "candidate").length,
  };

  if (!permissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec permissions */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-muted-foreground">
            Gérez les utilisateurs selon vos permissions
          </p>
          
          {/* Affichage des permissions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {permissions.canCreateUsers && (
              <Badge variant="outline" className="text-xs">
                <UserPlus className="w-3 h-3 mr-1" />
                Création autorisée
              </Badge>
            )}
            {permissions.canDeleteUsers && (
              <Badge variant="outline" className="text-xs">
                <Trash2 className="w-3 h-3 mr-1" />
                Suppression autorisée
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Modules: {permissions.accessibleModules.includes("*") ? "Tous" : permissions.accessibleModules.length}
            </Badge>
          </div>
        </div>
        
        {permissions.canCreateUsers && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-user">
                <UserPlus className="h-4 w-4 mr-2" />
                Créer un Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                createUserMutation.mutate(createForm);
              }} className="space-y-4">
                
                {/* Informations personnelles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      required
                      data-testid="input-create-firstname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                      required
                      data-testid="input-create-lastname"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                    data-testid="input-create-email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        required
                        data-testid="input-create-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePassword}
                      data-testid="button-generate-password"
                    >
                      Générer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Rôle *</Label>
                    <Select 
                      value={createForm.role} 
                      onValueChange={(value) => setCreateForm({ ...createForm, role: value })}
                    >
                      <SelectTrigger data-testid="select-create-role">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role: any) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center space-x-2">
                              <span>{role.label}</span>
                              {role.value === "admin" && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createForm.role && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {availableRoles.find((r: any) => r.value === createForm.role)?.description}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="department">Département</Label>
                    <Select 
                      value={createForm.department} 
                      onValueChange={(value) => setCreateForm({ ...createForm, department: value })}
                    >
                      <SelectTrigger data-testid="select-create-department">
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aviation">Aviation</SelectItem>
                        <SelectItem value="Sécurité">Sécurité</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="RH">Ressources Humaines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+221 77 123 45 67"
                    data-testid="input-create-phone"
                  />
                </div>

                {/* Avertissement pour les rôles sensibles */}
                {(createForm.role === "admin" || createForm.role === "hr") && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Attention : Vous créez un utilisateur avec des privilèges élevés. 
                      Assurez-vous que cette personne est autorisée à accéder aux données sensibles.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createUserMutation.isPending || !createForm.email || !createForm.password || !createForm.firstName || !createForm.lastName || !createForm.role}
                    data-testid="button-submit-create-user"
                  >
                    {createUserMutation.isPending ? "Création..." : "Créer l'Utilisateur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{userStats.admins}</p>
              </div>
              <Crown className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">RH</p>
                <p className="text-2xl font-bold">{userStats.hr}</p>
              </div>
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recruteurs</p>
                <p className="text-2xl font-bold">{userStats.recruiters}</p>
              </div>
              <UserPlus className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Candidats</p>
                <p className="text-2xl font-bold">{userStats.candidates}</p>
              </div>
              <Mail className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48" data-testid="select-role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {availableRoles.map((role: any) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-2 text-muted-foreground">Chargement...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userItem: any) => (
                  <TableRow key={userItem.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {userItem.profileImageUrl ? (
                          <img
                            src={userItem.profileImageUrl}
                            alt={`${userItem.firstName} ${userItem.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {userItem.firstName} {userItem.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {userItem.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {userItem.email || "Non défini"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {userItem.phone || "Non défini"}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(userItem.role || "candidate")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {userItem.department || "Non défini"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userItem.createdAt 
                        ? new Date(userItem.createdAt).toLocaleDateString("fr-FR")
                        : "Non défini"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {permissions.canEditUsers.includes(userItem.role || "candidate") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(userItem)}
                            data-testid={`button-edit-user-${userItem.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {permissions.canDeleteUsers && userItem.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(userItem)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-user-${userItem.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <form onSubmit={(e) => {
              e.preventDefault();
              updateUserMutation.mutate({ id: selectedUser.id, data: editForm });
            }} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">Prénom</Label>
                  <Input
                    id="edit-firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    data-testid="input-edit-firstname"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Nom</Label>
                  <Input
                    id="edit-lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    data-testid="input-edit-lastname"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  data-testid="input-edit-email"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  data-testid="input-edit-phone"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                  >
                    <SelectTrigger data-testid="select-edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role: any) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit-department">Département</Label>
                  <Select 
                    value={editForm.department} 
                    onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                  >
                    <SelectTrigger data-testid="select-edit-department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aviation">Aviation</SelectItem>
                      <SelectItem value="Sécurité">Sécurité</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="RH">Ressources Humaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                  data-testid="button-submit-edit-user"
                >
                  {updateUserMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}