import { useEffect, useRef, useState } from "react";
import { Camera, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CameraDialog({ facing: initial, onClose, onCapture }: { facing: "user" | "environment"; onClose: () => void; onCapture: (dataUrl: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState(initial);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    setErr(null);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera is not available in this browser.");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1600 } }, audio: false });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        if (video.current) { video.current.srcObject = stream; await video.current.play().catch(() => {}); }
      } catch (e) {
        setErr(e instanceof Error && e.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access or upload a photo instead." : (e as Error).message || "Could not open the camera.");
      }
    })();
    return () => { cancelled = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [facing]);

  const snap = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const g = c.getContext("2d")!;
    if (facing === "user") { g.translate(c.width, 0); g.scale(-1, 1); }
    g.drawImage(v, 0, 0);
    onCapture(c.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Take a photo">
      <div className="glass w-full max-w-xl overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between p-4">
          <p className="font-semibold">{facing === "user" ? "Front camera (selfie)" : "Back camera"}</p>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close camera"><X /></Button>
        </div>
        <div className="relative aspect-[3/4] bg-background sm:aspect-video">
          {err ? <p className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">{err}</p>
            : <video ref={video} playsInline muted className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />}
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-primary/50" />
        </div>
        <div className="flex items-center justify-center gap-3 p-4">
          <Button variant="glass" onClick={() => setFacing(facing === "user" ? "environment" : "user")}><SwitchCamera /> Switch</Button>
          <Button variant="hero" size="lg" onClick={snap} disabled={!!err}><Camera /> Capture</Button>
        </div>
      </div>
    </div>
  );
}
