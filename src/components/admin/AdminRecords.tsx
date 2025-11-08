import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Check, X, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Record {
  id: string;
  title: string;
  description: string | null;
  category: string;
  record_value: string;
  holder_name: string;
  image_url: string | null;
  verified: boolean;
  display_order: number;
  created_at: string;
}

export const AdminRecords = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    record_value: "",
    holder_name: "",
    image_url: "",
    verified: false,
    display_order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ["admin-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Record[];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("news").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from("records")
        .insert([{ ...data, image_url: imageUrl }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-records"] });
      toast({ title: "Record created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      let imageUrl = data.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from("records")
        .update({ ...data, image_url: imageUrl })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-records"] });
      toast({ title: "Record updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-records"] });
      toast({ title: "Record deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      record_value: "",
      holder_name: "",
      image_url: "",
      verified: false,
      display_order: 0,
    });
    setEditingId(null);
    setIsAdding(false);
    setImageFile(null);
  };

  const handleEdit = (record: Record) => {
    setFormData({
      title: record.title,
      description: record.description || "",
      category: record.category,
      record_value: record.record_value,
      holder_name: record.holder_name,
      image_url: record.image_url || "",
      verified: record.verified,
      display_order: record.display_order,
    });
    setEditingId(record.id);
    setIsAdding(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  if (isLoading) {
    return <div>Loading records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Records</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="p-6 space-y-4 bg-card border-border">
          <h3 className="text-xl font-semibold">
            {editingId ? "Edit Record" : "Add New Record"}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Record title"
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sports, Entertainment"
              />
            </div>

            <div className="space-y-2">
              <Label>Record Value *</Label>
              <Input
                value={formData.record_value}
                onChange={(e) => setFormData({ ...formData, record_value: e.target.value })}
                placeholder="e.g., $31 million, 100 meters in 9.58s"
              />
            </div>

            <div className="space-y-2">
              <Label>Record Holder *</Label>
              <Input
                value={formData.holder_name}
                onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                placeholder="Name of the record holder"
              />
            </div>

            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {formData.image_url && !imageFile && (
                <p className="text-sm text-muted-foreground">Current image set</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Record description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.verified}
              onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
            />
            <Label>Verified (publicly visible)</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              <Check className="w-4 h-4 mr-2" />
              {editingId ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {records?.map((record) => (
          <Card key={record.id} className="p-4 bg-card border-border">
            <div className="flex gap-4">
              {record.image_url && (
                <div
                  className="w-32 h-32 bg-muted rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${record.image_url})` }}
                />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{record.title}</h3>
                    <p className="text-sm text-primary">{record.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Record:</strong> {record.record_value}</p>
                  <p><strong>Holder:</strong> {record.holder_name}</p>
                  {record.description && <p className="text-muted-foreground">{record.description}</p>}
                  <p className="text-xs">
                    <strong>Status:</strong> {record.verified ? "✓ Verified" : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
