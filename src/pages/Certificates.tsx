import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCheck } from "lucide-react";

const Certificates = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold">Your Certificates</h1>
            <p className="text-muted-foreground text-lg">
              View, download, and request certifications
            </p>
          </div>

          <Card className="p-8 bg-card border-border text-center space-y-4 animate-fade-in">
            <FileCheck className="w-16 h-16 text-primary mx-auto" />
            <h3 className="text-xl font-semibold">Request Certification</h3>
            <p className="text-muted-foreground">
              Have a world record? Request official certification from our team
            </p>
            <Button className="bg-gradient-gold text-background hover:opacity-90">
              Request Certificate
            </Button>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Certificates</h2>
            {[1, 2].map((item) => (
              <Card key={item} className="p-6 bg-card border-border animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">Most Expensive Car Collection</h3>
                    <p className="text-sm text-muted-foreground">Issued: December 2024</p>
                  </div>
                  <Button variant="outline" className="border-primary text-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;
