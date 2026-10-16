 import { useEffect, useRef, useState } from "react";
import { Camera, SwitchCamera, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type CameraDialogProps = {
  facing: "user" | "environment";
  onClose: () => void;
  onCapture: (imageData: string) => void;
};

export function CameraDialog({
  facing: initialFacing,
  onClose,
  onCapture,
}: CameraDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facing, setFacing] = useState(initialFacing);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      setLoading(true);
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Camera access is unavailable. Open this page using localhost or HTTPS."
        );
        setLoading(false);
        return;
      }

      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        let stream: MediaStream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback for USB webcams that don't support facingMode.
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        const cameraError = err as DOMException;

        if (
          cameraError.name === "NotAllowedError" ||
          cameraError.name === "PermissionDeniedError"
        ) {
          setError(
            "Camera permission denied. Allow camera access in Chrome site settings."
          );
        } else if (
          cameraError.name === "NotFoundError" ||
          cameraError.name === "DevicesNotFoundError"
        ) {
          setError(
            "No camera found. Connect your Xiaomi USB webcam and try again."
          );
        } else if (
          cameraError.name === "NotReadableError" ||
          cameraError.name === "TrackStartError"
        ) {
          setError(
            "The camera is busy. Close the Windows Camera app and try again."
          );
        } else {
          setError(
            `${cameraError.name || "Camera error"}: ${
              cameraError.message || "Unable to open camera."
            } Check that this page uses localhost or HTTPS.`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      setError("Camera is not ready. Please wait and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not capture the image. Please try again.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCaptured(imageData);
    setError("");
  }

  function usePhoto() {
    if (!captured) return;

    onCapture(captured);
    onClose();
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="text-lg font-bold">EcoTwin AI Camera</h2>
            <p className="text-sm text-slate-400">
              Position one waste item in front of the camera.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeCamera}
            aria-label="Close camera"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-black">
            {captured ? (
              <img
                src={captured}
                alt="Captured waste item"
                className="max-h-[60vh] w-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-[60vh] w-full object-contain"
              />
            )}

            {loading && !error && (
              <p className="absolute rounded-lg bg-black/70 px-4 py-2 text-sm">
                Opening camera...
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-red-500/40 bg-red-950/50 p-3 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {!captured ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    setFacing((current) =>
                      current === "user" ? "environment" : "user"
                    )
                  }
                >
                  <SwitchCamera className="mr-2 h-4 w-4" />
                  Switch Camera
                </Button>

                <Button
                  type="button"
                  disabled={loading}
                  onClick={capturePhoto}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCaptured(null);
                    setError("");
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>

                <Button type="button" onClick={usePhoto}>
                  Use This Photo
                </Button>
              </>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-slate-400">
            Camera access requires permission and a secure browser context.
            AI identification happens after the image is submitted for analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CameraDialog;