import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentRequest {
  email: string;
  name: string;
  appointmentDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, appointmentDate }: AppointmentRequest = await req.json();

    console.log("Sending appointment confirmation to:", email);

    const formattedDate = new Date(appointmentDate).toLocaleString();

    const { data, error } = await resend.emails.send({
      from: "OWR Appointments <onboarding@resend.dev>",
      to: email,
      subject: "Appointment Confirmed",
      html: `
        <h1>Hello ${name}!</h1>
        <p>Your appointment has been confirmed for:</p>
        <p><strong>${formattedDate}</strong></p>
        <p>We look forward to seeing you.</p>
        <p>Best regards,<br>The OWR Team</p>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
