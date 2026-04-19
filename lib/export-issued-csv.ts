import type { CategoryIssueGroup } from "@/lib/group-issues-by-category";

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** カテゴリー名・項目名・生成IDのみ（ヘッダー付き、CRLF） */
export function buildIssuedListCsv(groups: CategoryIssueGroup[]): string {
  const header = ["カテゴリー", "項目名", "生成ID"].map(escapeCsvCell).join(",");
  const lines: string[] = [header];
  for (const g of groups) {
    const categoryLabel = g.category.label;
    for (const row of g.rows) {
      lines.push(
        [categoryLabel, row.itemName, row.codeId].map(escapeCsvCell).join(","),
      );
    }
  }
  return lines.join("\r\n");
}
