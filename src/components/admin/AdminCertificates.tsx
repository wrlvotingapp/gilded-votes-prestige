import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Upload, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

export const AdminCertificates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [certificateUrls, setCertificateUrls] = useState<Record<string, string>>({});
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const { data: certificates } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      
      // Fetch related user emails and candidate names
      if (data) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const candidateIds = [...new Set(data.map(c => c.candidate_id).filter(Boolean))];
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        
        const { data: candidates } = candidateIds.length > 0 
          ? await supabase.from("candidates").select("id, name").in("id", candidateIds)
          : { data: [] };
        
        return data.map(cert => ({
          ...cert,
          profiles: profiles?.find(p => p.id === cert.user_id),
          candidates: candidates?.find(c => c.id === cert.candidate_id),
        }));
      }
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("email");
      if (error) throw error;
      return data;
    },
  });

  const updateCertificateMutation = useMutation({
    mutationFn: async ({ id, status, url }: { id: string; status: string; url?: string }) => {
      const updateData: any = { status };
      if (url) updateData.certificate_url = url;
      if (status === "approved") updateData.issued_at = new Date().toISOString();

      const { error } = await supabase
        .from("certificates")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Certificate updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
  });

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from("certificates")
      .createSignedUrl(filePath, 3600); // 1 hour
    if (error) {
      console.error("Error generating signed URL:", error);
      return null;
    }
    return data.signedUrl;
  };

  const uploadAndSendCertificate = useMutation({
    mutationFn: async () => {
      if (!uploadingFile || !selectedUser) {
        throw new Error("Please select a user and upload a file");
      }

      // Upload file to Supabase Storage
      const fileExt = uploadingFile.name.split('.').pop();
      const fileName = `${selectedUser}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, uploadingFile);

      if (uploadError) throw uploadError;

      // Generate signed URL (valid for 1 year)
      const { data: signedData, error: signedError } = await supabase.storage
        .from("certificates")
        .createSignedUrl(fileName, 31536000); // 1 year in seconds

      if (signedError) throw signedError;
      const signedUrl = signedData.signedUrl;

      // Create certificate record
      const { error: insertError } = await supabase
        .from("certificates")
        .insert({
          user_id: selectedUser,
          status: "approved",
          certificate_file_url: fileName, // Store path, not URL
          issued_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-certificate-email", {
        body: { userId: selectedUser, certificateUrl: signedUrl },
      });

      if (emailError) console.error("Email error:", emailError);
      
      return signedUrl;
    },
    onSuccess: () => {
      toast({ title: "Certificate sent successfully!" });
      setSelectedUser("");
      setUploadingFile(null);
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error sending certificate", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Certificate Management</h3>
      
      {/* Send Certificate Section */}
      <Card className="p-6">
        <h4 className="text-md font-semibold mb-4">Send Certificate to User</h4>
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="md:w-[300px]">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email} {user.full_name ? `(${user.full_name})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex-1">
            <Input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
            />
          </div>
          
          <Button
            onClick={() => uploadAndSendCertificate.mutate()}
            disabled={!selectedUser || !uploadingFile || uploadAndSendCertificate.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {uploadAndSendCertificate.isPending ? "Sending..." : "Send Certificate"}
          </Button>
        </div>
      </Card>

      {/* Existing Certificates */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates?.map((cert: any) => (
              <TableRow key={cert.id}>
                <TableCell>{cert.profiles?.email}</TableCell>
                <TableCell>{cert.candidates?.name || "N/A"}</TableCell>
                <TableCell>
                  <span
                    className={
                      cert.status === "approved"
                        ? "text-green-600"
                        : cert.status === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  >
                    {cert.status}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(cert.requested_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {cert.status === "pending" ? (
                    <Input
                      size={1}
                      placeholder="Certificate URL"
                      value={certificateUrls[cert.id] || ""}
                      onChange={(e) =>
                        setCertificateUrls({ ...certificateUrls, [cert.id]: e.target.value })
                      }
                    />
                  ) : cert.certificate_file_url ? (
                    <Button
                      size="sm"
                      variant="link"
                      onClick={async () => {
                        const url = await getSignedUrl(cert.certificate_file_url);
                        if (url) window.open(url, "_blank");
                      }}
                    >
                      View Certificate
                    </Button>
                  ) : (
                    cert.certificate_url || "-"
                  )}
                </TableCell>
                <TableCell>
                  {cert.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateCertificateMutation.mutate({
                            id: cert.id,
                            status: "approved",
                            url: certificateUrls[cert.id],
                          })
                        }
                        disabled={!certificateUrls[cert.id]}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateCertificateMutation.mutate({
                            id: cert.id,
                            status: "rejected",
                          })
                        }
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
