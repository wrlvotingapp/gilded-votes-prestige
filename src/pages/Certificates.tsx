import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Certificates = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["user-certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const downloadCertificate = async (filePath: string) => {
    try {
      // Generate a signed URL for download
      const { data, error } = await supabase.storage
        .from("certificates")
        .createSignedUrl(filePath, 3600); // Valid for 1 hour

      if (error) throw error;

      // Open in new tab
      window.open(data.signedUrl, "_blank");
    } catch (error: any) {
      toast({
        title: "Error downloading certificate",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Your Certificates</h1>
            <p className="text-muted-foreground text-lg">
              View, download, and request certifications
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Certificates</h2>
            
            {isLoading ? (
              <Card className="p-6 bg-card border-border text-center">
                <p className="text-muted-foreground">Loading certificates...</p>
              </Card>
            ) : certificates && certificates.length > 0 ? (
              certificates.map((cert) => (
                <Card key={cert.id} className="p-6 bg-card border-border animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        Certificate
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={
                          cert.status === "approved" 
                            ? "text-green-600" 
                            : cert.status === "rejected" 
                            ? "text-red-600" 
                            : "text-yellow-600"
                        }>
                          {cert.status}
                        </span>
                      </p>
                      {cert.issued_at && (
                        <p className="text-sm text-muted-foreground">
                          Issued: {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                      )}
                      {cert.requested_at && !cert.issued_at && (
                        <p className="text-sm text-muted-foreground">
                          Requested: {new Date(cert.requested_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {cert.status === "approved" && cert.certificate_file_url && (
                      <Button 
                        variant="outline" 
                        className="border-primary text-primary"
                        onClick={() => downloadCertificate(cert.certificate_file_url)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-card border-border text-center">
                <FileCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No certificates yet. Contact an admin to receive your certificate.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
