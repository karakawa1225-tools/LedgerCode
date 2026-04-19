import { jsPDF } from "jspdf";

const A4_MM = { w: 210, h: 297 };

/**
 * 印刷用 DOM 内の各行（tr）下端を html2canvas の scale に合わせて canvas 座標に変換する。
 * ページ分割はこの Y 座標のところだけで行う。
 */
export function measureTableRowBottomsCanvasY(
  root: HTMLElement,
  canvasScale: number,
): number[] {
  const rootRect = root.getBoundingClientRect();
  const bottoms: number[] = [];
  for (const tr of root.querySelectorAll("tr")) {
    const r = tr.getBoundingClientRect();
    const bottomCss = r.bottom - rootRect.top + root.scrollTop;
    bottoms.push(Math.round(bottomCss * canvasScale));
  }
  return [...new Set(bottoms)].sort((a, b) => a - b);
}

/**
 * 縦に長い canvas を A4 相当の余白で複数ページに分割して PDF に載せる。
 * `rowBottomYsCanvas` を渡すと、その Y だけがページ区切りになり、行の途中で切れない。
 */
export function addCanvasToPdfPaginated(
  pdf: InstanceType<typeof jsPDF>,
  canvas: HTMLCanvasElement,
  marginMm: number,
  rowBottomYsCanvas?: number[],
): number {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const usableW = pageW - marginMm * 2;
  const usableH = pageH - marginMm * 2;
  const imgW = usableW;
  const imgH = (canvas.height * imgW) / canvas.width;

  const usableCanvasH = (usableH / imgH) * canvas.height;

  const useRowBreaks = Boolean(rowBottomYsCanvas && rowBottomYsCanvas.length > 0);
  let breaks: number[] = [];
  if (useRowBreaks) {
    breaks = [...new Set(rowBottomYsCanvas!)]
      .filter((y) => y > 0 && y <= canvas.height)
      .sort((a, b) => a - b);
    const last = breaks[breaks.length - 1];
    if (last < canvas.height) {
      breaks.push(canvas.height);
    }
  }

  let y0 = 0;
  let isFirst = true;
  let pageCount = 0;

  while (y0 < canvas.height - 0.5) {
    const limit = y0 + usableCanvasH;
    let y1 = y0;

    if (useRowBreaks) {
      for (const b of breaks) {
        if (b > y0 && b <= limit + 0.5) {
          y1 = Math.max(y1, b);
        }
      }
      if (y1 <= y0) {
        y1 = breaks.find((b) => b > y0) ?? canvas.height;
      }
    } else {
      y1 = Math.min(limit, canvas.height);
    }

    const srcY = y0;
    const srcH = Math.max(1, y1 - y0);
    let sliceH_mm = (srcH / canvas.height) * imgH;
    let displayH_mm = sliceH_mm;
    if (displayH_mm > usableH + 0.01) {
      displayH_mm = usableH;
    }

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.ceil(srcH);
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
    const data = slice.toDataURL("image/png");

    if (!isFirst) {
      pdf.addPage();
    }
    isFirst = false;
    pdf.addImage(data, "PNG", marginMm, marginMm, imgW, displayH_mm);
    pageCount++;

    y0 = y1;
    if (y0 >= canvas.height - 0.5) break;
  }

  return Math.max(1, pageCount);
}

/** 出力前の目安（実際のレイアウトと誤差あり） */
export function estimatePdfPageCount(
  issueCount: number,
  categoryBlockCount: number,
  marginMm = 12,
): number {
  if (issueCount === 0) return 0;
  const usableH = A4_MM.h - marginMm * 2;
  const titleBlockMm = 26;
  const perCategoryHeaderMm = 9;
  const perRowMm = 13;
  const tableChromeMm = 4;
  const totalMm =
    titleBlockMm +
    categoryBlockCount * (perCategoryHeaderMm + tableChromeMm) +
    issueCount * perRowMm;
  return Math.max(1, Math.ceil(totalMm / usableH));
}
