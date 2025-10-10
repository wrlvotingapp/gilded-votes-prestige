import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";
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

  const { data: certificates } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          profiles (email),
          candidates (name)
        `)
        .order("requested_at", { ascending: false });
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
      toast({ title: "Certificate updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
    },
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Certificate Management</h3>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Certificate URL</TableHead>
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
