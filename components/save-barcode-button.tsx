"use client";

import { useState } from "react";
import { downloadBlob, renderCode128PngBlob } from "@/lib/barcode-png";

export function SaveBarcodeButton({ codeId }: { codeId: string }) {
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const blob = await renderCode128PngBlob(codeId);
      downloadBlob(blob, `${codeId}.png`);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "保存に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={save}
      disabled={busy}
      className="whitespace-nowrap rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-900 transition hover:bg-teal-100 disabled:opacity-50 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-100 dark:hover:bg-teal-900/80"
    >
      {busy ? "保存中…" : "PNG保存"}
    </button>
  );
}
