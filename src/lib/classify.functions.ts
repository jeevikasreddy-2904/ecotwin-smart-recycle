 import { createServerFn } from "@tanstack/react-start";
import { CATEGORIES } from "./categories";

const MAX_LEN = 4_500_000;

const ALLOWED =
  /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

const INSTRUCTIONS = `
You are an AI waste-sorting assistant.
Identify the single main waste item in the provided image.

Allowed categories:
plastic, paper, glass, metal, organic, ewaste,
textile, hazardous, general, unknown.

Return ONLY a valid JSON object with these keys:
is_clear, category, item_name, confidence, explanation,
recyclability, preparation, reuse, disposal, safety_notice.

Rules:
- is_clear must be false if the image is unclear or the item cannot be identified.
- If unclear, use category "unknown". Never guess.
- category must be one of the allowed categories.
- confidence must be a number between 0 and 1.
- recyclability must be "likely", "depends", "unlikely", or "special".
- preparation, reuse, and disposal must be arrays of short strings.
- safety_notice must be a string or null.
- Give general disposal guidance, not location-specific rules.
- Mention appropriate safety precautions for hazardous or sharp items.
- Return JSON only, without Markdown or code fences.
`;

type Classification = {
  is_clear: boolean;
  category: string;
  item_name: string;
  confidence: number;
  explanation: string;
  recyclability: "likely" | "depends" | "unlikely" | "special";
  preparation: string[];
  reuse: string[];
  disposal: string[];
  safety_notice: string | null;
};

type Out =
  | { ok: true; data: string }
  | { ok: false; error: string; code: number };

export const classifyWaste = createServerFn({
  method: "POST",
})
  .inputValidator((d: { image: string }) => {
    if (!d || typeof d.image !== "string") {
      throw new Error("Missing image.");
    }

    if (d.image.length > MAX_LEN) {
      throw new Error("Image is too large. Please use a smaller image.");
    }

    if (!ALLOWED.test(d.image)) {
      throw new Error("Unsupported image format. Use JPEG, PNG, or WebP.");
    }

    return d;
  })
  .handler(async ({ data }): Promise<Out> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        ok: false,
        code: 500,
        error: "Gemini API key is missing. Check your .env file.",
      };
    }

    try {
      const commaIndex = data.image.indexOf(",");
      const imageHeader = data.image.slice(0, commaIndex);
      const base64Image = data.image.slice(commaIndex + 1);
      const mimeType = imageHeader
        .slice("data:".length)
        .split(";")[0];

      const model = "gemini-3-flash-preview";

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: INSTRUCTIONS }],
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: "Classify this waste item. Return JSON only." },
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                is_clear: { type: "BOOLEAN" },
                category: {
                  type: "STRING",
                  enum: [...CATEGORIES],
                },
                item_name: { type: "STRING" },
                confidence: { type: "NUMBER" },
                explanation: { type: "STRING" },
                recyclability: {
                  type: "STRING",
                  enum: ["likely", "depends", "unlikely", "special"],
                },
                preparation: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                reuse: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                disposal: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                },
                safety_notice: {
                  type: "STRING",
                  nullable: true,
                },
              },
              required: [
                "is_clear",
                "category",
                "item_name",
                "confidence",
                "explanation",
                "recyclability",
                "preparation",
                "reuse",
                "disposal",
                "safety_notice",
              ],
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Gemini API error:", response.status, result);

        const message =
          response.status === 400
            ? "Gemini rejected the request. Check the image and API request."
            : response.status === 401 || response.status === 403
              ? "Gemini API key is invalid or does not have access."
              : response.status === 429
                ? "Gemini quota exceeded. Check your API usage and limits."
                : `Gemini API error (${response.status}). Check the server terminal.`;

        return {
          ok: false,
          code: response.status,
          error: message,
        };
      }

      const text = result.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? "")
        .join("");

      if (!text) {
        console.error("Gemini returned no text:", result);

        return {
          ok: false,
          code: 502,
          error: "Gemini returned no classification. Please try again.",
        };
      }

      let parsed: Classification;

      try {
        parsed = JSON.parse(text);
      } catch {
        console.error("Gemini returned invalid JSON:", text);

        return {
          ok: false,
          code: 502,
          error: "Gemini returned an unreadable result. Please try again.",
        };
      }

      if (
        typeof parsed.is_clear !== "boolean" ||
        !CATEGORIES.includes(parsed.category as (typeof CATEGORIES)[number]) ||
        typeof parsed.item_name !== "string" ||
        typeof parsed.confidence !== "number" ||
        !Array.isArray(parsed.preparation) ||
        !Array.isArray(parsed.reuse) ||
        !Array.isArray(parsed.disposal)
      ) {
        return {
          ok: false,
          code: 502,
          error: "Gemini returned incomplete classification data.",
        };
      }

      return {
        ok: true,
        data: JSON.stringify(parsed),
      };
    } catch (error) {
      console.error("Gemini classification error:", error);

      return {
        ok: false,
        code: 502,
        error:
          "Could not contact Gemini. Check your internet connection and API access.",
      };
    }
  });