import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  Trophy,
  AlertCircle,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'blocked';
  date?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ApplicationTimelineProps {
  application: {
    status: string;
    createdAt: string;
    updatedAt: string;
    cvPath?: string;
    coverLetter?: string;
    diplomaPath?: string;
    autoScore?: number;
    manualScore?: number;
    availability?: string;
    salaryExpectation?: string;
  };
}

export function ApplicationTimeline({ application }: ApplicationTimelineProps) {
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: 'submitted',
        title: 'Candidature soumise',
        description: 'Votre candidature a été reçue et enregistrée',
        status: 'completed',
        date: application.createdAt,
        icon: Send,
      },
      {
        id: 'documents',
        title: 'Documents vérifiés',
        description: 'Vérification de vos documents (CV, lettre de motivation, diplômes)',
        status: application.cvPath ? 'completed' : 'current',
        date: application.cvPath ? application.updatedAt : undefined,
        icon: FileText,
      },
      {
        id: 'auto_review',
        title: 'Évaluation automatique',
        description: 'Analyse automatique de votre profil et attribution du score',
        status: application.autoScore ? 'completed' : 
                application.status === 'pending' ? 'current' : 'pending',
        date: application.autoScore ? application.updatedAt : undefined,
        icon: Clock,
      },
      {
        id: 'manual_review',
        title: 'Examen par le recruteur',
        description: 'Revue détaillée de votre candidature par un expert',
        status: application.status === 'reviewed' || 
                application.status === 'interview' || 
                application.status === 'accepted' ? 'completed' :
                application.status === 'pending' && application.autoScore ? 'current' : 'pending',
        date: application.manualScore ? application.updatedAt : undefined,
        icon: UserCheck,
      },
      {
        id: 'interview',
        title: 'Entretien',
        description: 'Entretien avec l\'équipe de recrutement',
        status: application.status === 'interview' || application.status === 'accepted' ? 'completed' :
                application.status === 'reviewed' ? 'current' : 'pending',
        icon: MessageSquare,
      },
      {
        id: 'decision',
        title: 'Décision finale',
        description: 'Résultat final de votre candidature',
        status: application.status === 'accepted' ? 'completed' :
                application.status === 'rejected' ? 'blocked' :
                application.status === 'interview' ? 'current' : 'pending',
        date: application.status === 'accepted' || application.status === 'rejected' ? application.updatedAt : undefined,
        icon: application.status === 'accepted' ? Trophy : 
              application.status === 'rejected' ? AlertCircle : Circle,
      },
    ];

    return steps;
  };

  const steps = getTimelineSteps();
  const currentStep = steps.find(step => step.status === 'current');
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'current':
        return 'text-blue-600 bg-blue-100';
      case 'blocked':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  const getStepIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'current':
        return 'text-blue-600';
      case 'blocked':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'En attente',
      reviewed: 'Examinée',
      interview: 'Entretien programmé',
      accepted: 'Acceptée',
      rejected: 'Refusée'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Suivi de votre candidature</CardTitle>
          <Badge 
            variant="outline" 
            className={application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                       application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                       application.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                       'bg-yellow-100 text-yellow-800'}
          >
            {getStatusText(application.status)}
          </Badge>
        </div>
        
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {currentStep && (
          <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-blue-900">Étape actuelle</p>
            <p className="text-blue-800">{currentStep.title}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                {/* Ligne de connexion */}
                {!isLast && (
                  <div 
                    className={`absolute left-6 top-12 w-0.5 h-8 ${
                      step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`}
                  />
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Icône de l'étape */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 
                    ${step.status === 'completed' ? 'border-green-500 bg-green-50' :
                      step.status === 'current' ? 'border-blue-500 bg-blue-50' :
                      step.status === 'blocked' ? 'border-red-500 bg-red-50' :
                      'border-gray-300 bg-gray-50'}
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${getStepIconColor(step.status)}`} />
                    )}
                  </div>
                  
                  {/* Contenu de l'étape */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`
                        text-base font-medium 
                        ${step.status === 'completed' ? 'text-green-900' :
                          step.status === 'current' ? 'text-blue-900' :
                          step.status === 'blocked' ? 'text-red-900' :
                          'text-gray-500'}
                      `}>
                        {step.title}
                      </h4>
                      
                      {step.date && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(step.date), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                      )}
                    </div>
                    
                    <p className={`
                      text-sm mt-1 
                      ${step.status === 'completed' ? 'text-green-700' :
                        step.status === 'current' ? 'text-blue-700' :
                        step.status === 'blocked' ? 'text-red-700' :
                        'text-gray-500'}
                    `}>
                      {step.description}
                    </p>
                    
                    {/* Informations additionnelles */}
                    {step.id === 'auto_review' && application.autoScore && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Score automatique: {application.autoScore}/100
                        </Badge>
                      </div>
                    )}
                    
                    {step.id === 'manual_review' && application.manualScore && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Score recruteur: {application.manualScore}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Prochaines étapes */}
        {application.status !== 'accepted' && application.status !== 'rejected' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Prochaines étapes</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {application.status === 'pending' && !application.cvPath && (
                <li>• Complétez votre profil et téléchargez vos documents</li>
              )}
              {application.status === 'pending' && application.cvPath && !application.autoScore && (
                <li>• Votre candidature est en cours d'évaluation automatique</li>
              )}
              {application.status === 'pending' && application.autoScore && (
                <li>• Un recruteur va examiner votre candidature</li>
              )}
              {application.status === 'reviewed' && (
                <li>• Vous serez contacté(e) pour l'organisation d'un entretien</li>
              )}
              {application.status === 'interview' && (
                <li>• Participez à votre entretien et attendez la décision finale</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}