import { CODE128_RENDER_OPTS } from "@/lib/barcode-code128";

/** ブラウザ専用: CODE128 を PNG の Blob にする */
export async function renderCode128PngBlob(text: string): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("バーコード画像の生成はブラウザ上でのみ利用できます。");
  }
  const bwipjs = (await import("bwip-js/browser")).default;
  const canvas = document.createElement("canvas");
  bwipjs.toCanvas(canvas, { ...CODE128_RENDER_OPTS, text });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("PNGの生成に失敗しました。"));
      },
      "image/png",
      1,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}
