import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const News = () => {
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
            {[1, 2, 3].map((item) => (
              <Card key={item} className="p-6 bg-card border-border hover:border-primary transition-all animate-fade-in">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>January 10, 2025</span>
                  </div>
                  <h2 className="text-2xl font-semibold">
                    New Record Category Added: Luxury Yachts
                  </h2>
                  <p className="text-muted-foreground">
                    We're excited to announce a new category for luxury yachts. Submit your nominations now!
                  </p>
                  <button className="text-primary hover:underline font-medium">
                    Read more →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
