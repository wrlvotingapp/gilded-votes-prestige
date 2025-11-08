import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.jpg";

interface VoteCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateName: string;
  categoryName: string;
}

export const VoteCertificateModal = ({
  open,
  onOpenChange,
  candidateName,
  categoryName,
}: VoteCertificateModalProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: logoUrl } = useQuery({
    queryKey: ["app-logo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "logo_url")
        .maybeSingle();
      return data?.setting_value || logo;
    },
  });

  const generateCertificateImage = async () => {
    if (!certificateRef.current) return null;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#1a1a2e",
      });
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });
      setIsGenerating(false);
      return blob;
    } catch (error) {
      console.error("Error generating certificate:", error);
      setIsGenerating(false);
      return null;
    }
  };

  const shareCaption = `I just voted for ${candidateName} in ${categoryName} at OWR Votes! 🎉 Make your voice heard too! #OWRVotes #IVoted`;

  const handleShare = async (platform: string) => {
    const blob = await generateCertificateImage();
    if (!blob) return;

    const file = new File([blob], "owr-certificate.png", { type: "image/png" });
    const url = URL.createObjectURL(blob);

    switch (platform) {
      case "facebook":
        if (navigator.share) {
          try {
            await navigator.share({
              files: [file],
              title: "I Voted in OWR!",
              text: shareCaption,
            });
          } catch (err) {
            window.open(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareCaption)}`,
              "_blank"
            );
          }
        } else {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareCaption)}`,
            "_blank"
          );
        }
        break;

      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareCaption)}&url=${encodeURIComponent(window.location.href)}`,
          "_blank"
        );
        break;

      case "instagram":
        if (navigator.share) {
          try {
            await navigator.share({
              files: [file],
              title: "I Voted in OWR!",
              text: shareCaption,
            });
          } catch (err) {
            const link = document.createElement("a");
            link.href = url;
            link.download = "owr-certificate.png";
            link.click();
            alert("Download the image and share it on Instagram!");
          }
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.download = "owr-certificate.png";
          link.click();
          alert("Download the image and share it on Instagram!");
        }
        break;

      case "download":
        const link = document.createElement("a");
        link.href = url;
        link.download = "owr-certificate.png";
        link.click();
        break;
    }

    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-primary/20 via-background to-accent/20 p-8 md:p-12 rounded-lg border-2 border-primary"
          >
            <div className="text-center space-y-6">
              <img
                src={logoUrl || logo}
                alt="OWR"
                className="w-24 h-24 mx-auto object-contain rounded-xl"
              />
              <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                  Certificate of Participation
                </h2>
                <div className="h-1 w-32 bg-gradient-gold mx-auto rounded-full" />
              </div>
              <div className="space-y-4">
                <p className="text-xl md:text-2xl font-semibold">
                  Yes, I Voted in OWR!
                </p>
                <p className="text-lg text-muted-foreground">
                  I cast my vote for
                </p>
                <p className="text-2xl font-bold text-primary">{candidateName}</p>
                <p className="text-lg text-muted-foreground">in</p>
                <p className="text-xl font-semibold">{categoryName}</p>
              </div>
              <div className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Thank you for participating in OWR Votes
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Share your vote on social media
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleShare("facebook")}
                disabled={isGenerating}
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => handleShare("instagram")}
                disabled={isGenerating}
                className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
              <Button
                onClick={() => handleShare("twitter")}
                disabled={isGenerating}
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => handleShare("download")}
                disabled={isGenerating}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
