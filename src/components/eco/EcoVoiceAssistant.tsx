 import { useEffect, useRef, useState } from "react";
import {
  Leaf,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Square,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const WELCOME_MESSAGE =
  "Hi! I'm Eco AI 🌱 Ask me about recycling, waste sorting, composting, e-waste, or how to protect our environment.";

function getEcoAnswer(question: string): string {
  const q = question.toLowerCase();

  if (/hello|hi\b|hey\b/.test(q)) {
    return "Hello! 🌱 I'm Eco AI. How can I help you make a greener choice today?";
  }

  if (/plastic|bottle|polythene|wrapper/.test(q)) {
    return "For plastic waste, first empty and clean the item if practical. Separate recyclable plastics from other waste and follow your local collection rules. Avoid burning plastic because it can release harmful fumes.";
  }

  if (/paper|cardboard|newspaper/.test(q)) {
    return "Keep paper and cardboard clean and dry. Separate them from food waste and grease, then place them in the appropriate recycling collection stream.";
  }

  if (/food|organic|compost|vegetable|fruit peel/.test(q)) {
    return "Food scraps and vegetable peels can often be composted. Keep organic waste separate from plastic and other non-compostable materials. Follow your local composting guidelines.";
  }

  if (/battery|electronic|e-waste|phone|laptop|charger/.test(q)) {
    return "Keep batteries and electronic waste separate from regular household waste. Do not burn, crush, or dismantle batteries. Take them to an authorized e-waste or battery collection facility.";
  }

  if (/glass/.test(q)) {
    return "Separate glass from general waste and follow local glass-recycling rules. Wrap broken glass securely, label it if possible, and keep it away from people handling waste.";
  }

  if (/metal|aluminium|can/.test(q)) {
    return "Metal cans and clean aluminium items are often recyclable. Empty containers, keep them separate from food waste, and check the collection rules in your area.";
  }

  if (/wet waste|dry waste|segregat|separate waste/.test(q)) {
    return "A useful first step is to separate wet or organic waste, dry recyclable waste, and hazardous or electronic waste. Keep sanitary and hazardous waste separate and follow your local municipal guidelines.";
  }

  if (/swachh bharat|swachh bharath/.test(q)) {
    return "Swachh Bharat Mission promotes cleanliness and improved waste management. You can support its goals by segregating waste, reducing litter, using appropriate collection services, and following your municipality's disposal rules.";
  }

  if (/save environment|environment|pollution|sustainab|eco-friendly/.test(q)) {
    return "Start with small actions: reduce single-use products, reuse items, separate waste, compost suitable organic materials, save water, and use authorized recycling services.";
  }

  if (/what can you do|who are you|your name/.test(q)) {
    return "I'm Eco AI, your recycling and environmental guidance assistant. I can offer general waste-sorting tips, explain recycling practices, and help you think through safer disposal options.";
  }

  return "I can help with recycling, plastic, paper, food waste, composting, e-waste, batteries, and environmental practices. Tell me which item you want to dispose of, and I'll suggest a practical next step. For local rules, check your municipal waste collection guidance.";
}

export default function EcoVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: WELCOME_MESSAGE,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function sendMessage(text = input) {
    const question = text.trim();

    if (!question) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      text: question,
    };

    const answer = getEcoAnswer(question);

    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      text: answer,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      assistantMessage,
    ]);

    setInput("");
  }

  function startListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-notice`,
          role: "assistant",
          text: "Voice input is not supported in this browser. Please use the text box, or try a supported browser with microphone permission enabled.",
        },
      ]);
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;

      if (transcript) {
        setInput(transcript);
        sendMessage(transcript);
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  function speakMessage(text: string) {
    if (!("speechSynthesis" in window)) {
      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-voice-notice`,
          role: "assistant",
          text: "Spoken replies are not supported in this browser.",
        },
      ]);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  }

  function closeAssistant() {
    setIsOpen(false);
    recognitionRef.current?.stop();
    setListening(false);
    stopSpeaking();
  }

  return (
    <div 
    className="eco-ai-floating"
style={{
  position: "fixed",
  bottom: "20px",
  left: "20px",
  zIndex: 99999,
  isolation: "isolate",
}}
>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Eco AI assistant"
          title="Chat with Eco AI"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-emerald-600 text-white shadow-xl transition duration-200 hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        >
          <Leaf className="h-7 w-7" />

          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-60" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-lime-400" />
          </span>

          <span className="pointer-events-none absolute bottom-16 left-0 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
            Ask Eco AI 🌱
          </span>
        </button>
      ) : (
        <section
          aria-label="Eco AI chat assistant"
          className="flex h-[min(590px,80vh)] w-[min(370px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-background text-foreground shadow-2xl"
        >
          {/* Header */}
          <header className="flex items-center justify-between bg-emerald-700 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Leaf className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-bold">Eco AI</h2>
                <p className="flex items-center gap-1 text-xs text-emerald-100">
                  <Sparkles className="h-3 w-3" />
                  Your recycling assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAssistant}
              aria-label="Close Eco AI"
              className="rounded-lg p-2 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div
            className="flex-1 space-y-4 overflow-y-auto p-4"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-emerald-600 text-white"
                      : "rounded-tl-sm border border-border bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>

                  {message.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => speakMessage(message.text)}
                      title="Read this reply aloud"
                      aria-label="Read reply aloud"
                      className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-emerald-700 transition hover:bg-emerald-500/10"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Listen
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex gap-2 overflow-x-auto border-t border-border px-3 py-2">
            {[
              "How to recycle plastic?",
              "Dispose of batteries",
              "What is composting?",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="shrink-0 rounded-full border border-emerald-600/30 px-3 py-1.5 text-xs transition hover:bg-emerald-500/10"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <button
              type="button"
              onClick={startListening}
              title={listening ? "Stop listening" : "Speak to Eco AI"}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                listening
                  ? "animate-pulse bg-red-500 text-white"
                  : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
              }`}
            >
              {listening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={listening ? "Listening..." : "Ask Eco AI..."}
              aria-label="Message Eco AI"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {speaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center justify-center gap-2 border-t border-border py-2 text-xs text-muted-foreground hover:bg-muted"
            >
              <Square className="h-3 w-3" />
              Stop spoken reply
            </button>
          )}

          <p className="px-3 pb-2 text-center text-[10px] text-muted-foreground">
            Eco AI provides general guidance. Check local waste rules.
          </p>
        </section>
      )}
    </div>
  );
}