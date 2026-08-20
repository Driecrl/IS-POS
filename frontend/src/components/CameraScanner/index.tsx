"use client";

import { useEffect, useRef } from "react";
import { startScanner } from "#lib/scanner";
import type { ScanHandle } from "#lib/scanner/types";
import type { CameraScannerProps } from "./types";
import "./style.css";

export default function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<ScanHandle | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (videoRef.current && canvasRef.current) {
      startScanner(videoRef.current, canvasRef.current, (code) => {
        if (!cancelled) onScan(code);
      })
        .then((handle) => {
          if (cancelled) handle.stop();
          else handleRef.current = handle;
        })
        .catch((err) => {
          alert("Camera access failed: " + err.message);
          onClose();
        });
    }

    return () => {
      cancelled = true;
      handleRef.current?.stop();
    };
  }, []);

  return (
    <div className="scanner-overlay">
      <div className="scanner-box">
        <video ref={videoRef} className="scanner-video" muted />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <button onClick={onClose} className="scanner-close">Close</button>
      </div>
    </div>
  );
}