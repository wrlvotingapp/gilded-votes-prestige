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
        {/* Animated Sunrise Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
        </div>
        
        {/* Twinkling Stars */}
        <div className="absolute inset-0">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-primary animate-pulse"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${1.5 + Math.random() * 2.5}s`,
                opacity: 0.2 + Math.random() * 0.8,
                boxShadow: `0 0 ${2 + Math.random() * 4}px hsl(45 100% 51% / 0.8)`,
              }}
            />
          ))}
        </div>

        {/* Shooting Stars */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animation: `shooting-star 3s linear infinite`,
                animationDelay: `${i * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Multiple Golden Glow Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-glow-pulse" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/25 rounded-full blur-[140px] animate-glow-pulse" style={{ animationDelay: '4s' }} />
        </div>

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
