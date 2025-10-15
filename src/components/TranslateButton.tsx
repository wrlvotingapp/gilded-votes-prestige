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
];

import { supabase } from "@/integrations/supabase/client";

// Call edge function to translate an array of strings in batch
async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const { data, error } = await supabase.functions.invoke("translate", {
    body: { texts, targetLang },
  });
  if (error) throw error;
  return (data?.translations as string[]) ?? texts;
}

// Traverse DOM, collect unique visible text nodes, translate in batch, and replace
async function translatePage(targetLang: string) {
  const rejectTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "CODE", "PRE"]);

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = (node as Text).parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (rejectTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-no-translate], [aria-hidden='true']")) return NodeFilter.FILTER_REJECT;
        const text = (node.textContent || "").trim();
        if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
        if (/^[\p{P}\p{S}]+$/u.test(text)) return NodeFilter.FILTER_REJECT; // only symbols/emojis
        return NodeFilter.FILTER_ACCEPT;
      },
    } as any
  );

  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);

  // Build unique text list to avoid translating duplicates
  const unique: string[] = [];
  const indexMap = new Map<string, number>();
  const buckets = new Map<string, Text[]>();

  for (const n of nodes) {
    const raw = (n.textContent || "").trim();
    const key = raw;
    if (!indexMap.has(key)) {
      indexMap.set(key, unique.length);
      unique.push(key);
      buckets.set(key, [n]);
    } else {
      buckets.get(key)!.push(n);
    }
  }

  if (unique.length === 0) return;

  // Perform translation in one call
  let result: string[] = [];
  try {
    result = await translateBatch(unique, targetLang);
  } catch (e) {
    console.error("translateBatch error", e);
    return;
  }

  // Apply translations
  unique.forEach((original, i) => {
    const translated = result[i] || original;
    for (const t of buckets.get(original) || []) {
      t.textContent = translated;
    }
  });

  // Set document language for accessibility/SEO
  document.documentElement.lang = targetLang;
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
className="fixed top-6 right-6 h-14 w-14 rounded-full shadow-gold bg-gradient-to-br from-primary to-accent hover:shadow-glow transition-all duration-300 z-50"
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
