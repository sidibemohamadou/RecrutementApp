import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X } from "lucide-react";
import { ObjectUploader } from "./ObjectUploader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertApplicationSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Job } from "@shared/schema";
import type { UploadResult } from "@uppy/core";
import { z } from "zod";

interface ApplicationModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const applicationFormSchema = insertApplicationSchema.extend({
  consent: z.boolean().refine(val => val === true, "Vous devez accepter le traitement des données"),
});

export function ApplicationModal({ job, isOpen, onClose }: ApplicationModalProps) {
  const [cvFile, setCvFile] = useState<string | null>(null);
  const [motivationFile, setMotivationFile] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      jobId: job?.id || 0,
      coverLetter: "",
      availability: undefined,
      salaryExpectation: "",
      consent: false,
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const { consent, ...applicationData } = data;
      const response = await apiRequest("POST", "/api/applications", {
        ...applicationData,
        cvPath: cvFile,
        motivationLetterPath: motivationFile,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été envoyée avec succès. Vous recevrez une confirmation par email.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      onClose();
      form.reset();
      setCvFile(null);
      setMotivationFile(null);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre candidature.",
        variant: "destructive",
      });
    },
  });

  const handleCvUpload = async () => {
    const response = await apiRequest("GET", "/api/objects/upload");
    const { uploadURL } = await response.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleCvComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL as string;
      const docResponse = await apiRequest("PUT", "/api/documents", {
        documentURL: uploadURL,
      });
      const { objectPath } = await docResponse.json();
      setCvFile(objectPath);
    }
  };

  const handleMotivationUpload = async () => {
    const response = await apiRequest("GET", "/api/objects/upload");
    const { uploadURL } = await response.json();
    return { method: "PUT" as const, url: uploadURL };
  };

  const handleMotivationComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL as string;
      const docResponse = await apiRequest("PUT", "/api/documents", {
        documentURL: uploadURL,
      });
      const { objectPath } = await docResponse.json();
      setMotivationFile(objectPath);
    }
  };

  const onSubmit = (data: any) => {
    createApplicationMutation.mutate(data);
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-application">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            Postuler pour {job.title}
          </DialogTitle>
          <p className="text-muted-foreground" data-testid="text-modal-company">
            {job.company}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Informations personnelles
              </h3>
              <p className="text-sm text-muted-foreground">
                Vos informations personnelles seront automatiquement utilisées depuis votre profil.
              </p>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Documents
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    CV * (PDF, DOC, DOCX - Max 5MB)
                  </Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    onGetUploadParameters={handleCvUpload}
                    onComplete={handleCvComplete}
                    buttonClassName="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col items-center" data-testid="upload-cv">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {cvFile ? "CV téléchargé ✓" : "Cliquez pour télécharger votre CV"}
                      </p>
                    </div>
                  </ObjectUploader>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Lettre de motivation (optionnel)
                  </Label>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                    onGetUploadParameters={handleMotivationUpload}
                    onComplete={handleMotivationComplete}
                    buttonClassName="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col items-center" data-testid="upload-motivation">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {motivationFile ? "Lettre téléchargée ✓" : "Cliquez pour télécharger votre lettre de motivation"}
                      </p>
                    </div>
                  </ObjectUploader>
                </div>
              </div>
            </div>

            {/* Cover Letter */}
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message de motivation</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={5}
                      placeholder="Expliquez votre motivation pour ce poste et mettez en avant vos compétences clés..."
                      data-testid="textarea-cover-letter"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Disponibilité
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de disponibilité</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          data-testid="input-availability-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryExpectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prétentions salariales</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: 45k € brut/an"
                          data-testid="input-salary-expectation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Consent */}
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-consent"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-muted-foreground">
                      J'autorise le traitement de mes données personnelles conformément au RGPD pour les besoins de ce processus de recrutement.{" "}
                      <a href="#" className="text-primary hover:text-primary/80">
                        En savoir plus
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createApplicationMutation.isPending || !cvFile}
                data-testid="button-submit-application"
              >
                {createApplicationMutation.isPending ? "Envoi en cours..." : "Envoyer ma candidature"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
