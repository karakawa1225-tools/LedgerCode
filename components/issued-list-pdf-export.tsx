"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import bwipjs from "bwip-js/browser";
import type { IssuedRow } from "@/lib/code-system";
import type { CategoryIssueGroup } from "@/lib/group-issues-by-category";
import { CODE128_RENDER_OPTS } from "@/lib/barcode-code128";
import {
  addCanvasToPdfPaginated,
  estimatePdfPageCount,
  measureTableRowBottomsCanvasY,
} from "@/lib/pdf-multipage";

const PDF_CANVAS_SCALE = 2;

function code128ToDataUrl(text: string): string {
  const canvas = document.createElement("canvas");
  bwipjs.toCanvas(canvas, { ...CODE128_RENDER_OPTS, text });
  return canvas.toDataURL("image/png");
}

type Payload = {
  groups: {
    categoryLabel: string;
    prefix: string;
    rows: IssuedRow[];
    barDataUrls: string[];
  }[];
  titleDate: string;
};

type Props = {
  groups: CategoryIssueGroup[];
};

export function IssuedListPdfExport({ groups }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [lastPageCount, setLastPageCount] = useState<number | null>(null);

  const issueCount = groups.reduce((n, g) => n + g.rows.length, 0);
  const estimatedPages = estimatePdfPageCount(issueCount, groups.length);

  const startExport = useCallback(async () => {
    if (groups.length === 0 || issueCount === 0) return;
    setBusy(true);
    try {
      const nextGroups: Payload["groups"] = [];
      for (const g of groups) {
        const barDataUrls = await Promise.all(g.rows.map((r) => code128ToDataUrl(r.codeId)));
        nextGroups.push({
          categoryLabel: g.category.label,
          prefix: g.category.prefix,
          rows: g.rows,
          barDataUrls,
        });
      }
      const titleDate = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());
      setPayload({ groups: nextGroups, titleDate });
    } catch {
      setBusy(false);
    }
  }, [groups, issueCount]);

  useEffect(() => {
    if (!payload || !printRef.current) return;

    const run = async () => {
      const el = printRef.current;
      if (!el) {
        setPayload(null);
        setBusy(false);
        return;
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await new Promise((r) => setTimeout(r, 280));

      try {
        const rowBottomsCss = measureTableRowBottomsCanvasY(el, PDF_CANVAS_SCALE);
        const canvas = await html2canvas(el, {
          scale: PDF_CANVAS_SCALE,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        const theoreticalH = el.scrollHeight * PDF_CANVAS_SCALE;
        const hFix = theoreticalH > 0 ? canvas.height / theoreticalH : 1;
        const rowBottoms = [...new Set(rowBottomsCss.map((y) => Math.round(y * hFix)))]
          .map((y) => Math.min(y, canvas.height))
          .filter((y) => y > 0)
          .sort((a, b) => a - b);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pages = addCanvasToPdfPaginated(pdf, canvas, 12, rowBottoms);
        setLastPageCount(pages);
        const stamp = new Date().toISOString().slice(0, 10);
        pdf.save(`管理コード一覧_${stamp}.pdf`);
      } finally {
        setPayload(null);
        setBusy(false);
      }
    };

    run();
  }, [payload]);

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={startExport}
          disabled={issueCount === 0 || busy}
          className="inline-flex w-fit items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {busy ? "PDF生成中…" : "PDF出力（A4・縦）"}
        </button>
        {issueCount > 0 && !busy ? (
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            目安: 約 <strong className="tabular-nums text-zinc-900 dark:text-zinc-100">{estimatedPages}</strong>{" "}
            枚（A4・余白12mm）
          </span>
        ) : null}
      </div>
      {lastPageCount != null ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          直近の保存: A4 縦 <strong className="tabular-nums">{lastPageCount}</strong> ページ
        </p>
      ) : issueCount > 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          PDF は A4 縦・余白 12mm。保存後、ここに確定ページ数が表示されます。
        </p>
      ) : null}

      <div
        ref={printRef}
        className="pointer-events-none absolute left-[-9999px] top-0 bg-white text-black"
        style={{
          width: "182mm",
          padding: "11mm 14mm",
          fontFamily: "system-ui, sans-serif",
        }}
        aria-hidden
      >
        {payload ? (
          <>
            <h1
              style={{
                fontSize: "17pt",
                fontWeight: 700,
                margin: "0 0 6px",
                letterSpacing: "0.02em",
              }}
            >
              管理コード一覧表
            </h1>
            <p style={{ fontSize: "10.5pt", margin: "0 0 18px", color: "#444" }}>{payload.titleDate}</p>

            {payload.groups.map((g, gi) => (
              <div key={`${g.prefix}-${gi}`} style={{ marginBottom: gi < payload.groups.length - 1 ? 20 : 0 }}>
                <h2
                  style={{
                    fontSize: "11.5pt",
                    fontWeight: 700,
                    margin: "0 0 8px",
                    paddingBottom: 4,
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {g.categoryLabel}{" "}
                  <span style={{ fontWeight: 400, fontFamily: "monospace", fontSize: "10pt" }}>
                    [{g.prefix}]
                  </span>
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "10pt",
                    lineHeight: 1.35,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #bbb",
                          padding: "7px 8px",
                          textAlign: "left",
                          background: "#f0f0f2",
                          width: "32%",
                        }}
                      >
                        項目名
                      </th>
                      <th
                        style={{
                          border: "1px solid #bbb",
                          padding: "7px 8px",
                          textAlign: "left",
                          background: "#f0f0f2",
                          width: "28%",
                        }}
                      >
                        生成ID
                      </th>
                      <th
                        style={{
                          border: "1px solid #bbb",
                          padding: "7px 8px",
                          textAlign: "center",
                          background: "#f0f0f2",
                          width: "40%",
                        }}
                      >
                        バーコード（CODE128）
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((row, ri) => (
                      <tr key={row.codeId} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                        <td
                          style={{
                            border: "1px solid #bbb",
                            padding: "7px 8px",
                            verticalAlign: "top",
                          }}
                        >
                          {row.itemName}
                        </td>
                        <td
                          style={{
                            border: "1px solid #bbb",
                            padding: "7px 8px",
                            fontFamily: "monospace",
                            fontSize: "9.5pt",
                            verticalAlign: "top",
                          }}
                        >
                          {row.codeId}
                        </td>
                        <td
                          style={{
                            border: "1px solid #bbb",
                            padding: "6px 8px",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <img
                            src={g.barDataUrls[ri]}
                            alt=""
                            style={{ height: "32px", width: "auto", maxWidth: "100%" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
