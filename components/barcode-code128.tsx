"use client";

import { useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js/browser";
import { CODE128_RENDER_OPTS } from "@/lib/barcode-code128";

export function BarcodeCode128({ text, className }: { text: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    try {
      bwipjs.toCanvas(canvas, { ...CODE128_RENDER_OPTS, text });
      setError(false);
    } catch {
      setError(true);
    }
  }, [text]);

  if (!text) return null;
  if (error) {
    return <span className="text-xs text-red-600 dark:text-red-400">バーコードを表示できません</span>;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={`CODE128: ${text}`}
    />
  );
}
