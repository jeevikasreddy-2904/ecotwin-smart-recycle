import { createServerFn } from "@tanstack/react-start";
import { CATEGORIES } from "./categories";

const MAX_LEN = 4_500_000; // ~3.3MB of base64
const ALLOWED = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["is_clear", "category", "item_name", "confidence", "explanation", "recyclability", "preparation", "reuse", "disposal", "safety_notice"],
  properties: {
    is_clear: { type: "boolean", description: "False if the photo is blurry, dark, shows no waste item, or several mixed items so a reliable classification is not possible." },
    category: { type: "string", enum: [...CATEGORIES] },
    item_name: { type: "string" },
    confidence: { type: "number", description: "Your self-assessed probability (0-1) that the category is correct." },
    explanation: { type: "string", description: "1-2 sentences on the visual cues used." },
    recyclability: { type: "string", enum: ["likely", "depends", "unlikely", "special"] },
    preparation: { type: "array", items: { type: "string" } },
    reuse: { type: "array", items: { type: "string" } },
    disposal: { type: "array", items: { type: "string" } },
    safety_notice: { type: ["string", "null"] },
  },
};

const INSTRUCTIONS = `You are a waste-sorting assistant. Look at the photo and classify the single main waste item.
Categories: plastic, paper (paper/cardboard), glass, metal, organic, ewaste (electronics, cables, batteries inside devices), textile, hazardous (loose batteries, paint, chemicals, medicines, bulbs, gas canisters), general (non-recyclable residual waste), unknown.
Rules:
- If the image is unclear, contains no waste item, or you cannot identify the material reliably, set is_clear=false and category="unknown" and explain what is wrong in "explanation". Do not guess.
- For composite items, choose the dominant material and mention separation in preparation and safety_notice.
- Keep each list item short (max ~15 words), 1-4 items per list. Empty lists are fine.
- Disposal guidance must be general; never claim specific local rules. Add a safety_notice for hazardous, sharp, damaged or composite items, otherwise null.`;

type Out = { ok: true; data: unknown } | { ok: false; error: string; code: number };

export const classifyWaste = createServerFn({ method: "POST" })
  .inputValidator((d: { image: string }) => {
    if (!d || typeof d.image !== "string") throw new Error("Missing image");
    if (d.image.length > MAX_LEN) throw new Error("Image is too large");
    if (!ALLOWED.test(d.image.slice(0, 64) + "A")) throw new Error("Unsupported image format");
    return d;
  })
  .handler(async ({ data }): Promise<Out> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false, code: 500, error: "AI service is not configured." };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: INSTRUCTIONS,
        input: [{ role: "user", content: [
          { type: "input_text", text: "Classify this waste item." },
          { type: "input_image", image_url: data.image },
        ] }],
        text: { format: { type: "json_schema", name: "waste_classification", strict: true, schema } },
      }),
    });

    if (!res.ok || !res.body) {
      const msg = res.status === 429 ? "Too many scans right now. Please wait a moment and try again."
        : res.status === 402 ? "AI credits have run out for this workspace. Add credits to keep scanning."
        : res.status === 403 ? "AI access is currently blocked for this workspace."
        : `AI service error (${res.status}).`;
      return { ok: false, code: res.status, error: msg };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let failure: string | null = null;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, i);
        buf = buf.slice(i + 2);
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload);
            if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
            else if (ev.type === "response.refusal.delta" || ev.type === "response.failed" || ev.type === "error") failure = "The AI could not analyse this image.";
          } catch { /* partial */ }
        }
      }
    }
    if (failure && !text) return { ok: false, code: 502, error: failure };
    try {
      return { ok: true, data: JSON.parse(text) };
    } catch {
      return { ok: false, code: 502, error: "The AI returned an unreadable answer. Please try again." };
    }
  });
