import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  userId: string;
  certificateUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, certificateUrl }: EmailRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user email
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // Note: This is a placeholder. You'll need to set up Resend or another email service
    // For now, we'll just log the email details
    console.log("Certificate email details:", {
      to: profile.email,
      name: profile.full_name,
      certificateUrl,
    });

    // TODO: Implement actual email sending with Resend
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // await resend.emails.send({
    //   from: "certificates@yourdomain.com",
    //   to: profile.email,
    //   subject: "Your Certificate is Ready!",
    //   html: `<p>Dear ${profile.full_name || "User"},</p>
    //          <p>Your certificate is now available!</p>
    //          <p><a href="${certificateUrl}">Download Certificate</a></p>`
    // });

    return new Response(
      JSON.stringify({ success: true, message: "Email notification logged" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-certificate-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
