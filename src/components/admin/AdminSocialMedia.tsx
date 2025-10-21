import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

export const AdminSocialMedia = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    icon: "",
    display_order: 0,
  });

  const { data: socialMediaLinks, isLoading } = useQuery({
    queryKey: ["social-media-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_links")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data as SocialMediaLink[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SocialMediaLink> & { id: string }) => {
      const { error } = await supabase
        .from("social_media_links")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-links"] });
      toast.success("Social media link updated");
      setEditingId(null);
      setFormData({ platform: "", url: "", icon: "", display_order: 0 });
    },
    onError: () => {
      toast.error("Failed to update social media link");
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newLink: Omit<SocialMediaLink, "id">) => {
      const { error } = await supabase
        .from("social_media_links")
        .insert([newLink]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-links"] });
      toast.success("Social media link added");
      setIsAdding(false);
      setFormData({ platform: "", url: "", icon: "", display_order: 0 });
    },
    onError: () => {
      toast.error("Failed to add social media link");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_media_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-media-links"] });
      toast.success("Social media link deleted");
    },
    onError: () => {
      toast.error("Failed to delete social media link");
    },
  });

  const handleEdit = (link: SocialMediaLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      display_order: link.display_order,
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else if (isAdding) {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ platform: "", url: "", icon: "", display_order: 0 });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Social Media Links</h2>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{isAdding ? "Add New Link" : "Edit Link"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Input
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="e.g., Instagram"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Icon (Lucide icon name)</label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., Instagram, Facebook, Twitter"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {socialMediaLinks?.map((link) => (
          <Card key={link.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <h3 className="font-semibold">{link.platform}</h3>
                <p className="text-sm text-muted-foreground">{link.url}</p>
                <p className="text-xs text-muted-foreground">Icon: {link.icon} | Order: {link.display_order}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(link)}
                  disabled={editingId !== null || isAdding}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteMutation.mutate(link.id)}
                  disabled={editingId !== null || isAdding}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
