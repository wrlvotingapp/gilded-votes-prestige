import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TranslateRequestBody {
  texts: string[];
  targetLang: string; // ISO code like 'es', 'ca', 'en', 'fr'
}

function sanitizeTexts(texts: string[]): string[] {
  // Ensure strings, trim, and limit excessively long entries
  return texts
    .map((t) => (typeof t === "string" ? t : String(t)))
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t.length > 2000 ? t.slice(0, 2000) : t))
    .slice(0, 500); // hard cap to avoid huge prompts
}

async function translateWithAI(texts: string[], targetLang: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const systemPrompt =
    "You are a professional UI translator. Translate the provided UI strings into the target language. Maintain meaning, tone, and keep emojis, brand names, and variables unchanged. Return only the translations via the provided tool. Do not add explanations.";

  const userPrompt = JSON.stringify({ targetLang, texts });

  const body: any = {
    // model: "google/gemini-2.5-flash", // optional
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          "Translate this array of UI strings into '" +
          targetLang +
          "'. Preserve emojis and punctuation.",
      },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "deliver_translations",
          description:
            "Return translations for the provided strings in the same order as input.",
          parameters: {
            type: "object",
            properties: {
              translations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["translations"],
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "deliver_translations" } },
  };

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      return { error: "Rate limits exceeded, please try again later." };
    }
    if (response.status === 402) {
      return {
        error:
          "Payment required, please add funds to your Lovable AI workspace.",
      };
    }
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    return { error: "AI gateway error" };
  }

  const json = await response.json();
  // Try to extract from tool calls (OpenAI-compatible schema)
  try {
    const toolCalls = json.choices?.[0]?.message?.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const argsStr = toolCalls[0]?.function?.arguments;
      const args = JSON.parse(argsStr);
      const translations: string[] = args.translations || [];
      return { translations };
    }
  } catch (e) {
    console.warn("Failed to parse tool call, trying content fallback:", e);
  }

  // Fallback: try to parse content as JSON
  try {
    const content = json.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.translations)) {
        return { translations: parsed.translations };
      }
      if (Array.isArray(parsed)) {
        return { translations: parsed as string[] };
      }
    }
  } catch {
    // ignore
  }

  return { error: "Invalid AI response" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLang } = (await req.json()) as TranslateRequestBody;
    if (!targetLang || !texts) {
      return new Response(
        JSON.stringify({ error: "Missing texts or targetLang" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const clean = sanitizeTexts(texts);
    if (clean.length === 0) {
      return new Response(
        JSON.stringify({ translations: [] }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await translateWithAI(clean, targetLang);
    if ((result as any).error) {
      const msg = (result as any).error as string;
      const status = msg.includes("Rate limits") ? 429 : msg.includes("Payment") ? 402 : 500;
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const translations = (result as any).translations as string[];
    // Ensure array length matches input; if not, pad with originals
    const padded = clean.map((t, i) => translations?.[i] ?? t);

    return new Response(JSON.stringify({ translations: padded }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("translate function error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});