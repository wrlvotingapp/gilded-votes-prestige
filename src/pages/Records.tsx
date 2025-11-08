import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Record {
  id: string;
  title: string;
  description: string | null;
  category: string;
  record_value: string;
  holder_name: string;
  image_url: string | null;
  verified: boolean;
}

const Records = () => {
  const { data: records, isLoading } = useQuery({
    queryKey: ["records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("verified", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Record[];
    },
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">World Records</h1>
              <p className="text-muted-foreground text-lg mt-2">
                Browse all official world records
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading records...</p>
            </div>
          ) : records && records.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((record) => (
                <Card key={record.id} className="overflow-hidden bg-card border-border hover:border-primary transition-all animate-fade-in">
                  {record.image_url ? (
                    <div
                      className="w-full h-48 bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${record.image_url})` }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Award className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="text-xl font-semibold">{record.title}</h3>
                    <p className="text-sm text-primary font-medium">{record.record_value}</p>
                    <p className="text-sm text-muted-foreground">
                      Held by: {record.holder_name}
                    </p>
                    {record.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {record.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-primary">Category: {record.category}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No records available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
