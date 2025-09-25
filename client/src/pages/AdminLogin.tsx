import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, ArrowLeft, Plane, UserCheck, Users, Briefcase, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/admin/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Redirection selon le rôle admin
      setLocation(data.redirectPath || "/admin");
    },
    onError: (error: any) => {
      setError(error.message || "Erreur de connexion");
    }
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  const roleDescriptions = [
    {
      icon: Shield,
      title: "Super Admin",
      description: "Accès complet, gestion des utilisateurs",
      color: "text-red-600"
    },
    {
      icon: Users,
      title: "Ressources Humaines",
      description: "Gestion des employés et des candidats",
      color: "text-blue-600"
    },
    {
      icon: UserCheck,
      title: "Recruteur",
      description: "Gestion des offres et entretiens",
      color: "text-green-600"
    },
    {
      icon: Briefcase,
      title: "Manager",
      description: "Supervision et reporting",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header avec retour */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-slate-800 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
              <div className="flex items-center gap-2 text-blue-600 mt-1">
                <Plane className="h-4 w-4" />
                <span className="text-sm font-medium">AeroRecrutement</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600">Espace réservé aux administrateurs</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5" />
              Connexion Administrateur
            </CardTitle>
            <CardDescription className="text-slate-200">
              Accès sécurisé pour les administrateurs uniquement
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email administrateur</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="admin@aerorecrut.com"
                  data-testid="input-admin-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="Votre mot de passe"
                    data-testid="input-admin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-900 hover:to-slate-700" 
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            {/* Note sécurité */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <Settings className="h-4 w-4 inline mr-1" />
                Seuls les comptes administrateurs peuvent accéder à cette section
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Types de rôles disponibles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Rôles d'administration</h3>
          <div className="grid grid-cols-2 gap-4">
            {roleDescriptions.map((role, index) => (
              <div key={index} className="text-center">
                <role.icon className={`h-6 w-6 mx-auto mb-2 ${role.color}`} />
                <h4 className="font-medium text-sm text-gray-900">{role.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lien vers l'espace candidat */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/login")}
            data-testid="link-candidate"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            ← Retour à l'espace candidat
          </Button>
        </div>

        {/* Comptes de test admin */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">🔐 Comptes administrateurs</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Super Admin:</strong> mohamed.admin@aerorecrut.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}