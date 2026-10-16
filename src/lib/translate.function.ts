 import { createServerFn } from "@tanstack/react-start";

export const translateEcoText = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: { text: string; language: string }) => data
  )
  .handler(async ({ data }) => {
    const languages: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      kn: "Kannada",
      te: "Telugu",
      ta: "Tamil",
    };

    if (data.language === "en") return data.text;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing.");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate the following message into ${languages[data.language] ?? "English"}. Return only the translated text, not the original English.

${data.text}`,
            }],
          }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation failed (${response.status}).`);
    }

    const result = await response.json();
    const translated = result.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();

    if (!translated) throw new Error("Translation was empty.");

    return translated;
  });