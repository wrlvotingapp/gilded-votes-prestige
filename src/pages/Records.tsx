import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Records = () => {
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
            <Button className="bg-gradient-gold text-background hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Submit Record
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden bg-card border-border hover:border-primary transition-all animate-fade-in">
                <div className="w-full h-48 bg-muted" />
                <div className="p-4 space-y-2">
                  <h3 className="text-xl font-semibold">Most Expensive Watch</h3>
                  <p className="text-sm text-muted-foreground">
                    Patek Philippe valued at $31 million
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-primary">Category: Luxury</span>
                    <Button variant="outline" size="sm">View Details</Button>
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

export default Records;
