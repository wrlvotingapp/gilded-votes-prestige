import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export const AdminLogo = () => {
  const [logoUrl, setLogoUrl] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentLogo } = useQuery({
    queryKey: ["app-logo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "logo_url")
        .maybeSingle();
      return data?.setting_value || "";
    },
  });

  const updateLogoMutation = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          setting_key: "logo_url",
          setting_value: url,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Logo updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["app-logo"] });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from("logos")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Upload failed", variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("logos")
      .getPublicUrl(fileName);

    setLogoUrl(publicUrl);
    updateLogoMutation.mutate(publicUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Website Logo</h3>
        {currentLogo && (
          <img
            src={currentLogo}
            alt="Current logo"
            className="w-32 h-32 object-contain mb-4 border rounded"
          />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="logo-url">Logo URL</Label>
          <Input
            id="logo-url"
            value={logoUrl || currentLogo}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="Enter logo URL or upload below"
          />
        </div>

        <div>
          <Label htmlFor="logo-upload">Upload Logo</Label>
          <Input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        <Button
          onClick={() => updateLogoMutation.mutate(logoUrl)}
          disabled={!logoUrl}
        >
          <Upload className="w-4 h-4 mr-2" />
          Update Logo
        </Button>
      </div>
    </div>
  );
};
