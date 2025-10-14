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

// Translate a string using LibreTranslate
async function translateText(text: string, targetLang: string) {
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: targetLang,
        format: "text",
      }),
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
}

// Traverse DOM and translate visible text nodes
async function translatePage(targetLang: string) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const nodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) {
    const content = node.textContent?.trim();
    if (content && content.length > 2 && !/^\s*$/.test(content)) {
      nodes.push(node);
    }
  }

  for (const textNode of nodes) {
    const original = textNode.textContent || "";
    const translated = await translateText(original, targetLang);
    textNode.textContent = translated;
  }
}

export const TranslateButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSelected = localStorage.getItem("translate-language-selected");
    if (hasSelected) {
      setIsVisible(false);
    }
  }, []);

  const handleLanguageSelect = async (langCode: string) => {
    localStorage.setItem("translate-language-selected", "true");
    setIsVisible(false);
    setIsOpen(false);
    await translatePage(langCode);
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
