import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Vote = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategory)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory,
  });

  const { data: candidates } = useQuery({
    queryKey: ["candidates", selectedSubcategory],
    queryFn: async () => {
      if (!selectedSubcategory) return [];
      const { data, error } = await supabase
        .from("candidates")
        .select(`
          *,
          candidate_images (
            id,
            image_url,
            display_order
          )
        `)
        .eq("subcategory_id", selectedSubcategory)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSubcategory,
  });

  const { data: userVotes } = useQuery({
    queryKey: ["user-votes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("votes")
        .select("candidate_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((v) => v.candidate_id);
    },
    enabled: !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("votes")
        .insert({ user_id: user.id, candidate_id: candidateId });
      
      if (error) throw error;

      const { data: candidate } = await supabase
        .from("candidates")
        .select("vote_count")
        .eq("id", candidateId)
        .single();

      if (candidate) {
        await supabase
          .from("candidates")
          .update({ vote_count: candidate.vote_count + 1 })
          .eq("id", candidateId);
      }
    },
    onSuccess: () => {
      toast({
        title: "Vote cast successfully!",
        description: "Your vote has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-votes"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error: any) => {
      const message = typeof error?.message === 'string' && /already voted|subcategory|duplicate key/i.test(error.message)
        ? "You've already voted in this subcategory."
        : (error?.message || "Failed to cast vote");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold">Vote for Records</h1>
              <p className="text-muted-foreground text-lg">
                Select a category to begin voting
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {categories?.map((category) => (
                <Card
                  key={category.id}
                  className="p-6 bg-card border-border hover:border-primary transition-all cursor-pointer animate-fade-in"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.image_url && (
                    <div
                      className="w-full h-48 bg-muted rounded-lg mb-4 bg-cover bg-center"
                      style={{ backgroundImage: `url(${category.image_url})` }}
                    />
                  )}
                  <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-lg text-primary mb-2">{category.full_name}</p>
                  {category.description && (
                    <p className="text-muted-foreground">{category.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSubcategory) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>

            <div className="text-center space-y-2 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold">Select Subcategory</h1>
              <p className="text-muted-foreground text-lg">
                Choose a specific record type
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories?.map((subcategory) => (
                <Card
                  key={subcategory.id}
                  className="p-6 bg-card border-border hover:border-primary transition-all cursor-pointer animate-fade-in"
                  onClick={() => setSelectedSubcategory(subcategory.id)}
                >
                  {subcategory.image_url && (
                    <div
                      className="w-full h-48 bg-muted rounded-lg mb-4 bg-cover bg-center"
                      style={{ backgroundImage: `url(${subcategory.image_url})` }}
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{subcategory.name}</h3>
                  {subcategory.description && (
                    <p className="text-sm text-muted-foreground">{subcategory.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedSubcategory(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subcategories
          </Button>

          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Vote for Candidates</h1>
            <p className="text-muted-foreground text-lg">
              Cast your vote for your favorite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates?.map((candidate) => {
              const hasVoted = userVotes?.includes(candidate.id);
              const mainImage = candidate.candidate_images?.[0]?.image_url;

              return (
                <Card
                  key={candidate.id}
                  className="overflow-hidden bg-card border-border hover:border-primary transition-all animate-fade-in"
                >
                  {mainImage && (
                    <div
                      className="w-full h-48 bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${mainImage})` }}
                    />
                  )}
                  <div className="p-4 space-y-3">
                    <h3 className="text-xl font-semibold">{candidate.name}</h3>
                    {candidate.description && (
                      <p className="text-sm text-muted-foreground">{candidate.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        {candidate.vote_count} votes
                      </span>
                      <Button
                        onClick={() => voteMutation.mutate(candidate.id)}
                        disabled={hasVoted || voteMutation.isPending}
                        className="bg-gradient-gold text-background hover:opacity-90"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        {hasVoted ? "Voted" : "Vote"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
