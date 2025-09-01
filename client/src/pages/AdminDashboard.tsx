import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  LogOut,
  Plus,
  BarChart3,
  PieChart,
  Target,
  Award,
  Activity,
  Clock,
  CheckCircle,
  X,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar
} from "recharts";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [skills, setSkills] = useState<string[]>(['']);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salary, setSalary] = useState('');
  const [contractType, setContractType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/admin/jobs"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/admin/applications"],
  });
  
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ["/api/admin/kpis"],
  });
  
  const { data: applicationAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics/applications"],
  });
  
  const { data: jobAnalytics, isLoading: jobAnalyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics/jobs"],
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const resetForm = () => {
    setJobTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setRequirements('');
    setSalary('');
    setContractType('');
    setExperienceLevel('');
    setSkills(['']);
  };

  const previewJob = () => ({
    title: jobTitle,
    company: company,
    location: location,
    description: description,
    requirements: requirements,
    salary: salary,
    contractType: contractType,
    experienceLevel: experienceLevel,
    skills: skills.filter(skill => skill.trim() !== '')
  });

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
              <span className="text-sm text-muted-foreground">
                {(user as any)?.firstName} {(user as any)?.lastName}
              </span>
              <Badge variant="secondary">
                {(user as any)?.role === "admin" ? "Super Admin" : 
                 (user as any)?.role === "hr" ? "RH" : "Recruteur"}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analyse
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Créer une offre
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vue d'ensemble</h2>
              <div className="flex space-x-2">
                <Link href="/admin/applications">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Candidatures
                  </Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle offre
                  </Button>
                </Link>
              </div>
            </div>

            {/* KPIs Cards */}
            {kpisLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-muted rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Candidatures</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis?.totalApplications || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Taux conversion: {kpis?.conversionRate || 0}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Offres Actives</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis?.totalJobs || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {kpis?.totalCandidates || 0} candidats inscrits
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temps Moyen</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis?.avgProcessingTime || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      jours de traitement
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Équipe RH</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis?.totalRecruiters || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      recruteurs actifs
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Distribution */}
            {kpis?.statusCounts && (
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Candidatures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{kpis.statusCounts.pending}</div>
                      <div className="text-sm text-muted-foreground">En attente</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{kpis.statusCounts.assigned}</div>
                      <div className="text-sm text-muted-foreground">Assignées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{kpis.statusCounts.scored}</div>
                      <div className="text-sm text-muted-foreground">Notées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{kpis.statusCounts.reviewed}</div>
                      <div className="text-sm text-muted-foreground">Examinées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{kpis.statusCounts.interview}</div>
                      <div className="text-sm text-muted-foreground">Entretiens</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{kpis.statusCounts.accepted}</div>
                      <div className="text-sm text-muted-foreground">Acceptées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{kpis.statusCounts.rejected}</div>
                      <div className="text-sm text-muted-foreground">Refusées</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Jobs */}
            {kpis?.topPerformingJobs && (
              <Card>
                <CardHeader>
                  <CardTitle>Offres les plus populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kpis.topPerformingJobs.map((job: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <Badge variant="secondary">{job.applications} candidatures</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analyses et Graphiques</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Applications */}
              {applicationAnalytics?.monthlyApplications && (
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des Candidatures</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={applicationAnalytics.monthlyApplications}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Status Distribution Pie */}
              {applicationAnalytics?.statusDistribution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={applicationAnalytics.statusDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {applicationAnalytics.statusDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Job Popularity */}
              {jobAnalytics?.jobPopularity && (
                <Card>
                  <CardHeader>
                    <CardTitle>Popularité des Offres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={jobAnalytics.jobPopularity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="applications" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Score Distribution */}
              {applicationAnalytics?.scoreDistribution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution des Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={applicationAnalytics.scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <h2 className="text-2xl font-bold">Créer une nouvelle offre</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Formulaire Dynamique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="jobTitle">Titre du poste *</Label>
                    <Input 
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Ex: Développeur Full Stack"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Entreprise *</Label>
                    <Input 
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ex: TechCorp"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Localisation *</Label>
                    <Input 
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Paris, France"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contractType">Type de contrat</Label>
                      <Select value={contractType} onValueChange={setContractType}>
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
                      <Label htmlFor="experienceLevel">Niveau d'expérience</Label>
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
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
                    <Label htmlFor="salary">Salaire</Label>
                    <Input 
                      id="salary"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="Ex: 45k - 60k €"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez le poste, les missions..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Exigences</Label>
                    <Textarea 
                      id="requirements"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Formation, expérience requise..."
                      rows={3}
                    />
                  </div>

                  {/* Dynamic Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Compétences requises</Label>
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => updateSkill(index, e.target.value)}
                            placeholder="Ex: React, Node.js, SQL..."
                          />
                          {skills.length > 1 && (
                            <Button 
                              type="button" 
                              onClick={() => removeSkill(index)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={resetForm}>
                      <X className="h-4 w-4 mr-2" />
                      Réinitialiser
                    </Button>
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Créer l'offre
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu en temps réel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
                    <div>
                      <h3 className="text-xl font-bold text-primary">
                        {jobTitle || "Titre du poste"}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {company || "Nom de l'entreprise"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📍 {location || "Localisation"}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {contractType && (
                        <Badge variant="secondary">{contractType}</Badge>
                      )}
                      {experienceLevel && (
                        <Badge variant="outline">{experienceLevel}</Badge>
                      )}
                      {salary && (
                        <Badge variant="default">💰 {salary}</Badge>
                      )}
                    </div>

                    {description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-sm">{description}</p>
                      </div>
                    )}

                    {requirements && (
                      <div>
                        <h4 className="font-semibold mb-2">Exigences</h4>
                        <p className="text-sm">{requirements}</p>
                      </div>
                    )}

                    {skills.filter(skill => skill.trim() !== '').length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Compétences</h4>
                        <div className="flex gap-2 flex-wrap">
                          {skills.filter(skill => skill.trim() !== '').map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestion</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/admin/applications">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Candidatures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Gérer toutes les candidatures reçues
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/jobs">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Offres d'emploi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Consulter et modifier les offres
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {(user as any)?.role === "admin" && (
                <Link href="/admin/users">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Utilisateurs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Gestion des comptes utilisateurs
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}