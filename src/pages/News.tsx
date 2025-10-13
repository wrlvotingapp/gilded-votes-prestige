import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const News = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["published-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Latest News</h1>
            <p className="text-muted-foreground text-lg">
              Stay updated with the latest announcements
            </p>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">Loading...</p>
              </Card>
            ) : news && news.length > 0 ? (
              news.map((item) => (
                <Card key={item.id} className="p-6 bg-card border-border hover:border-primary transition-all animate-fade-in">
                  <div className="space-y-4">
                    {item.cover_image_url && (
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-64 object-cover rounded" />
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl font-semibold">{item.title}</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{item.body}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <p className="text-center text-muted-foreground">No news available yet.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
