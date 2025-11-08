import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import * as LucideIcons from "lucide-react";
import logo from "@/assets/logo.jpg";

const defaultLogo = logo;

interface SocialMediaLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

export const FollowUsScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [followedPlatforms, setFollowedPlatforms] = useState<Set<string>>(new Set());

  const { data: socialMediaLinks } = useQuery({
    queryKey: ["social-media-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_links")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data as SocialMediaLink[];
    },
  });

  const { data: logoUrl } = useQuery({
    queryKey: ["app-logo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "logo_url")
        .maybeSingle();
      return data?.setting_value || defaultLogo;
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("followedSocialMedia");
    if (stored === "true") {
      onComplete();
    }
  }, [onComplete]);

  const handleFollow = (platformId: string, url: string) => {
    window.open(url, "_blank");
    setFollowedPlatforms((prev) => new Set(prev).add(platformId));
  };

  const handleContinue = () => {
    if (socialMediaLinks && followedPlatforms.size >= socialMediaLinks.length) {
      localStorage.setItem("followedSocialMedia", "true");
      onComplete();
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  const allFollowed = socialMediaLinks && followedPlatforms.size >= socialMediaLinks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={logoUrl || defaultLogo}
              alt="OWR Votes"
              className="w-24 h-24 object-contain rounded-2xl shadow-lg"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Follow Us on Social Media
          </CardTitle>
          <CardDescription className="text-base mt-2">
            To continue, please follow all our social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {socialMediaLinks?.map((link) => (
              <Card key={link.id} className="border-2">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={followedPlatforms.has(link.id)}
                        disabled
                        className="pointer-events-none"
                      />
                      {getIcon(link.icon)}
                      <span className="font-semibold text-lg">{link.platform}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFollow(link.id, link.url)}
                    disabled={followedPlatforms.has(link.id)}
                  >
                    {followedPlatforms.has(link.id) ? "Followed" : "Follow"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!allFollowed}
            className="w-full mt-6"
            size="lg"
          >
            Continue to App
          </Button>

          {!allFollowed && (
            <p className="text-sm text-muted-foreground text-center">
              You need to follow all {socialMediaLinks?.length || 0} platforms to continue
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
