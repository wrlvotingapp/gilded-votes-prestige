import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Image as ImageIcon } from "lucide-react";

export const AdminCandidates = () => {
  const [form, setForm] = useState({ subcategory_id: "", name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([""]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subcategories } = useQuery({
    queryKey: ["admin-subcategories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select(`*, categories(name)`);
      if (error) throw error;
      return data;
    },
  });

  const { data: candidates } = useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          *,
          subcategories (name, categories(name)),
          candidate_images (id, image_url, display_order)
        `)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let candidateId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from("candidates")
          .update({ ...form })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("candidates")
          .insert(form)
          .select()
          .single();
        if (error) throw error;
        candidateId = data.id;
      }

      // Handle images
      const validImages = images.filter((img) => img.trim());
      if (validImages.length > 0 && candidateId) {
        await supabase
          .from("candidate_images")
          .delete()
          .eq("candidate_id", candidateId);

        const imageRecords = validImages.map((url, idx) => ({
          candidate_id: candidateId,
          image_url: url,
          display_order: idx,
        }));

        const { error } = await supabase.from("candidate_images").insert(imageRecords);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: editingId ? "Candidate updated" : "Candidate created" });
      queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
      setForm({ subcategory_id: "", name: "", description: "" });
      setImages([""]);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Candidate deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-candidates"] });
    },
  });

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Candidate" : "Add New Candidate"}
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Subcategory</Label>
            <Select value={form.subcategory_id} onValueChange={(v) => setForm({ ...form, subcategory_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories?.map((sub: any) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.categories?.name} - {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Rolex Submariner"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Images</Label>
            {images.map((img, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  value={img}
                  onChange={(e) => {
                    const newImages = [...images];
                    newImages[idx] = e.target.value;
                    setImages(newImages);
                  }}
                  placeholder="Image URL"
                />
                {idx === images.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setImages([...images, ""])}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()}>
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm({ subcategory_id: "", name: "", description: "" });
                  setImages([""]);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Existing Candidates</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {candidates?.map((cand: any) => (
            <Card key={cand.id} className="p-4">
              <div className="space-y-2">
                {cand.candidate_images?.[0]?.image_url && (
                  <img
                    src={cand.candidate_images[0].image_url}
                    alt={cand.name}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <h4 className="font-semibold">{cand.name}</h4>
                <p className="text-xs text-primary">
                  {cand.subcategories?.categories?.name} - {cand.subcategories?.name}
                </p>
                {cand.description && <p className="text-sm text-muted-foreground">{cand.description}</p>}
                <p className="text-sm">Votes: {cand.vote_count}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setForm({ ...cand });
                      setEditingId(cand.id);
                      const imgUrls = cand.candidate_images?.map((img: any) => img.image_url) || [""];
                      setImages(imgUrls.length ? imgUrls : [""]);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(cand.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
