 import {
  translateEcoText,
  type EcoLanguage,
} from "./translate.function";

export async function speakText(
  text: string,
  language: EcoLanguage = "en"
) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    alert("Speech is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  try {
    const translated = await translateEcoText({
      data: { text, language },
    });

    const locale: Record<EcoLanguage, string> = {
      en: "en-IN",
      hi: "hi-IN",
      kn: "kn-IN",
      te: "te-IN",
      ta: "ta-IN",
    };

    const utterance = new SpeechSynthesisUtterance(translated);
    utterance.lang = locale[language]??"en-IN";
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (item) =>
        item.lang.toLowerCase() ===
        locale[language].toLowerCase()
    );

    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Translation or speech failed:", error);
    alert(
      "Translation failed. Check your internet connection and Gemini API availability."
    );
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}