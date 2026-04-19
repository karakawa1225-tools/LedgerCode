import type { Category, IssuedRow } from "@/lib/code-system";
import { prefixFromCodeId } from "@/lib/ledger-storage";

export type CategoryIssueGroup = {
  category: Category;
  rows: IssuedRow[];
};

/** カテゴリー定義の並びで、発行済みをプレフィックスごとにまとめる。未定義プレフィックスは末尾に「未分類」として追加 */
export function groupIssuesByCategory(
  issues: IssuedRow[],
  categories: Category[],
): CategoryIssueGroup[] {
  const byPrefix = new Map<string, IssuedRow[]>();
  for (const row of issues) {
    const p = prefixFromCodeId(row.codeId);
    if (!p) continue;
    if (!byPrefix.has(p)) byPrefix.set(p, []);
    byPrefix.get(p)!.push(row);
  }

  const known = new Set(categories.map((c) => c.prefix));
  const result: CategoryIssueGroup[] = [];

  for (const c of categories) {
    const rows = byPrefix.get(c.prefix);
    if (rows?.length) {
      result.push({ category: c, rows });
    }
  }

  for (const [p, rows] of byPrefix) {
    if (!known.has(p) && rows.length) {
      result.push({
        category: {
          id: `orphan-${p}`,
          label: `未分類`,
          prefix: p,
          notes: "",
        },
        rows,
      });
    }
  }

  return result;
}
