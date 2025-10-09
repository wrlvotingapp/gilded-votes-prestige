import { Trophy, Award, Vote, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: Vote,
      title: "Vote for Records",
      description: "Cast your vote for the most luxurious and expensive items across various categories",
    },
    {
      icon: Trophy,
      title: "Submit Records",
      description: "Have something extraordinary? Submit your record and get it officially recognized",
    },
    {
      icon: FileCheck,
      title: "Get Certified",
      description: "Request official certification for your world record achievements",
    },
    {
      icon: Award,
      title: "View Rankings",
      description: "Explore the latest rankings and see what's trending in luxury records",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-dark py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(45_100%_51%/0.1),transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Official World Records
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Vote for the most luxurious items, submit your own records, and get officially certified
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/vote">
                <Button size="lg" className="bg-gradient-gold text-background hover:opacity-90 text-lg px-8">
                  Start Voting
                </Button>
              </Link>
              <Link to="/records">
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary text-primary hover:bg-primary/10">
                  View Records
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What You Can Do
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-gold animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-dark">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Make History?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of users who are voting and submitting records every day
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-gold text-background hover:opacity-90 text-lg px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
