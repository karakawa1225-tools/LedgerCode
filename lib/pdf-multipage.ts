import { jsPDF } from "jspdf";

const A4_MM = { w: 210, h: 297 };

/** 縦に長い canvas を A4 相当の余白で複数ページに分割して PDF に載せる。戻り値はページ数 */
export function addCanvasToPdfPaginated(
  pdf: InstanceType<typeof jsPDF>,
  canvas: HTMLCanvasElement,
  marginMm: number,
): number {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const usableW = pageW - marginMm * 2;
  const usableH = pageH - marginMm * 2;
  const imgW = usableW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let offsetY = 0;
  let isFirst = true;
  let pageCount = 0;

  while (offsetY < imgH - 0.5) {
    const sliceH = Math.min(usableH, imgH - offsetY);
    const srcY = (offsetY / imgH) * canvas.height;
    const srcH = (sliceH / imgH) * canvas.height;

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.max(1, Math.ceil(srcH));
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
    const data = slice.toDataURL("image/png");

    if (!isFirst) {
      pdf.addPage();
    }
    isFirst = false;
    pdf.addImage(data, "PNG", marginMm, marginMm, imgW, sliceH);
    offsetY += sliceH;
    pageCount++;
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
