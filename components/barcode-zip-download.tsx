"use client";

import { useState } from "react";
import type { IssuedRow } from "@/lib/code-system";
import { downloadBlob, renderCode128PngBlob } from "@/lib/barcode-png";

type Props = {
  issues: IssuedRow[];
  variant: "all" | "current";
  disabled?: boolean;
};

export function BarcodeZipDownload({ issues, variant, disabled }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (issues.length === 0) return;
    setBusy(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(
        variant === "all" ? "barcodes_all" : "barcodes_category",
      );
      for (const row of issues) {
        const blob = await renderCode128PngBlob(row.codeId);
        folder?.file(`${row.codeId}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const stamp = new Date().toISOString().slice(0, 10);
      const suffix = variant === "all" ? "all" : "category";
      downloadBlob(zipBlob, `barcodes_${suffix}_${stamp}.zip`);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "ZIPの作成に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const label =
    variant === "all"
      ? "全件バーコードをZIPで保存"
      : "このカテゴリーのみZIPで保存";

  return (
    <button
      type="button"
      onClick={run}
      disabled={disabled || issues.length === 0 || busy}
      className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 px-3 py-2 text-xs font-medium text-cyan-950 transition hover:from-cyan-100 hover:to-teal-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-900 dark:from-cyan-950/50 dark:to-teal-950/50 dark:text-cyan-100 dark:hover:from-cyan-900/60 dark:hover:to-teal-900/60"
    >
      {busy ? "ZIP作成中…" : label}
    </button>
  );
}
