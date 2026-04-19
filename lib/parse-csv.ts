/** 1行をカンマ区切り（ダブルクォート対応）で分割 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(unquoteCell(cur));
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(unquoteCell(cur));
  return result;
}

function unquoteCell(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).replace(/""/g, '"');
  }
  return t;
}

export type ParsedCsvImport = {
  /** 1始まりの行番号（データ行） */
  rows: { line: number; categoryKey: string; itemName: string }[];
  errors: string[];
};

const CATEGORY_HEADERS = ["カテゴリー", "category", "prefix", "カテゴリ"];
const ITEM_HEADERS = ["項目名", "項目", "item", "name", "品目"];

function findColIndex(headers: string[], candidates: string[]): number {
  const trimmed = headers.map((h) => h.trim());
  for (let i = 0; i < trimmed.length; i++) {
    const h = trimmed[i];
    const hLower = h.toLowerCase();
    for (const c of candidates) {
      const ct = c.trim();
      if (h === ct || hLower === ct.toLowerCase()) return i;
    }
  }
  return -1;
}

/** CSVテキストを解析。1行目はヘッダ（カテゴリー列・項目名列を自動検出） */
export function parseCategoryItemCsv(text: string): ParsedCsvImport {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    errors.push("データが不足しています（ヘッダ行と1行以上のデータが必要です）。");
    return { rows: [], errors };
  }

  const headerCells = parseCsvLine(lines[0]);
  const catIdx = findColIndex(headerCells, CATEGORY_HEADERS);
  const itemIdx = findColIndex(headerCells, ITEM_HEADERS);

  if (catIdx < 0 || itemIdx < 0) {
    errors.push(
      `ヘッダを認識できませんでした。1行目に「カテゴリー」と「項目名」に相当する列名を含めてください（例: カテゴリー,項目名）。検出: [${headerCells.join(" | ")}]`,
    );
    return { rows: [], errors };
  }
  if (catIdx === itemIdx) {
    errors.push("カテゴリー列と項目名列が同じです。");
    return { rows: [], errors };
  }

  const rows: ParsedCsvImport["rows"] = [];
  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const cells = parseCsvLine(lines[i]);
    const cat = cells[catIdx] ?? "";
    const item = cells[itemIdx] ?? "";
    rows.push({ line: lineNo, categoryKey: cat, itemName: item });
  }

  return { rows, errors };
}

export const CSV_TEMPLATE = `カテゴリー,項目名
顧客管理,株式会社サンプル
custm,英字プレフィックスでも可
仕入先管理,サプライヤー商事
`;
