import { useEffect, useRef, useState } from "react";

const REQUESTS_KEY = "ecotwin-route-cleaning-requests-v1";

type CleaningRequest = {
  id?: string;
  requestId?: string;
  location?: string;
  binName?: string;
  route?: string;
};

export default function CleaningRequestNotification() {
  const [request, setRequest] = useState<CleaningRequest | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const previousIds = useRef<Set<string> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  async function playSound() {
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }

      const ctx = audioRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.35
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.35);
    } catch (error) {
      console.error("Notification sound failed:", error);
    }
  }

  useEffect(() => {
    function checkRequests() {
      try {
        const saved = localStorage.getItem(REQUESTS_KEY);
        const requests: CleaningRequest[] = saved
          ? JSON.parse(saved)
          : [];

        const ids = new Set(
          requests
            .map((item) => item.id ?? item.requestId)
            .filter((id): id is string => Boolean(id))
        );

        if (previousIds.current === null) {
          previousIds.current = ids;
          return;
        }

        const newRequest = requests.find((item) => {
          const id = item.id ?? item.requestId;
          return Boolean(id && !previousIds.current!.has(id));
        });

        previousIds.current = ids;

        if (newRequest) {
          setRequest(newRequest);
          if (soundEnabled) void playSound();
        }
      } catch (error) {
        console.error("Could not read requests:", error);
      }
    }

    checkRequests();
    const timer = window.setInterval(checkRequests, 2000);

    return () => window.clearInterval(timer);
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          await playSound();
          setSoundEnabled(true);
        }}
        className="fixed bottom-5 right-5 z-40 rounded-full
          border border-emerald-400/30 bg-[#102c25]
          px-4 py-3 text-sm text-emerald-200 shadow-xl"
      >
        {soundEnabled ? "🔔 Sound On" : "🔕 Enable Sound"}
      </button>

      {request && (
        <div
          role="alert"
          className="fixed right-5 top-5 z-50 w-[min(360px,calc(100vw-2rem))]
            rounded-2xl border border-emerald-400/40
            bg-[#102c25] p-5 text-white shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧹</span>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                EcoTwin AI · New Alert
              </p>

              <h3 className="mt-1 text-lg font-bold">
                New Cleaning Request
              </h3>

              <p className="mt-3 text-sm text-emerald-100">
                Location: {request.location ?? "Collection point"}
              </p>

              {request.binName && (
                <p className="mt-1 text-sm text-emerald-100">
                  Smart Bin: {request.binName}
                </p>
              )}

              {request.route && (
                <p className="mt-1 text-sm text-emerald-100">
                  Route: {request.route}
                </p>
              )}

              <p className="mt-2 break-all text-xs text-emerald-300/70">
                ID: {request.id ?? request.requestId ?? "New request"}
              </p>

              <button
                type="button"
                onClick={() => setRequest(null)}
                className="mt-4 rounded-lg bg-emerald-400 px-4 py-2
                  text-sm font-bold text-[#102c25]"
              >
                Dismiss
              </button>
            </div>

            <button
              type="button"
              aria-label="Close notification"
              onClick={() => setRequest(null)}
              className="text-xl text-emerald-100/70"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}