import { useState, useEffect } from "react";
import { Languages, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const LANGUAGES = [
  { code: "ca", name: "Català", flag: "🇪🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export const TranslateButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSelected = localStorage.getItem("translate-language-selected");
    if (hasSelected) {
      setIsVisible(false);
    }
  }, []);

  const handleLanguageSelect = (langCode: string) => {
    localStorage.setItem("translate-language-selected", "true");
    setIsVisible(false);
    setIsOpen(false);

    // Use Google Translate's URL-based translation
    const currentUrl = window.location.href;
    const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;
    window.location.href = translateUrl;
  };

  if (!isVisible) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-gold bg-gradient-to-br from-primary to-accent hover:shadow-glow transition-all duration-300 z-50"
        aria-label="Translate page"
      >
        <Languages className="h-6 w-6 text-primary-foreground" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center justify-between">
              <span>Select Language</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Choose your preferred language to translate this page
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant="outline"
                className="justify-start gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => handleLanguageSelect(lang.code)}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
