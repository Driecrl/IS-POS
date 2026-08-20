import jsQR from "jsqr";
import type { ScanHandle } from "./types";

export function startScanner(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  onDetect: (data: string) => void
): Promise<ScanHandle> {
  return navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.play().catch(() => {
        // Ignore AbortError from React Strict Mode's double-invoke cleanup
      });

      let active = true;
      const ctx = canvas.getContext("2d")!;

      function tick() {
        if (!active) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            onDetect(code.data);
          }
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      return {
        stop: () => {
          active = false;
          stream.getTracks().forEach((t) => t.stop());
        },
      };
    });
}