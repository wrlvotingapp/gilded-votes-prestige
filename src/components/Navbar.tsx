import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpg";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut, user } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { path: "/", label: "Home" },
  ];

  const authenticatedLinks = [
    { path: "/", label: "Home" },
    { path: "/vote", label: "Vote" },
    { path: "/records", label: "Records" },
    { path: "/news", label: "News" },
    { path: "/certificates", label: "Certificates" },
    { path: "/appointments", label: "Appointments" },
  ];

  const navLinks = isAuthenticated ? authenticatedLinks : publicLinks;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="OWR" className="w-10 h-10 rounded-lg object-cover shadow-gold" />
            <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              OWR VOTES
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-gold text-background hover:opacity-90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-gold text-background hover:opacity-90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

