import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

const Vote = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Vote for Records</h1>
            <p className="text-muted-foreground text-lg">
              Cast your vote for the most luxurious items
            </p>
          </div>

          <div className="grid gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="p-6 bg-card border-border hover:border-primary transition-all animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-48 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-semibold">Most Expensive Diamond</h3>
                    <p className="text-muted-foreground">
                      A stunning 100-carat pink diamond worth $50 million
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">1,234 votes</span>
                      <Button className="bg-gradient-gold text-background hover:opacity-90">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Vote
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
