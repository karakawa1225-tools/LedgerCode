import type { Category } from "@/lib/code-system";
import { isValidPrefix } from "@/lib/code-system";

/**
 * CSVのカテゴリー列の値と登録カテゴリーを照合する。
 * - 英小文字5文字ならプレフィックス一致
 * - それ以外はカテゴリー名の完全一致（前後空白除去）→ 大文字小文字無視の一致
 */
export function matchCategoryByKey(key: string, categories: Category[]): Category | undefined {
  const t = key.trim();
  if (!t) return undefined;
  const lower = t.toLowerCase();
  if (/^[a-z]{5}$/.test(lower) && isValidPrefix(lower)) {
    const byPrefix = categories.find((c) => c.prefix === lower);
    if (byPrefix) return byPrefix;
  }
  const exact = categories.find((c) => c.label.trim() === t);
  if (exact) return exact;
  return categories.find((c) => c.label.trim().toLowerCase() === t.toLowerCase());
}
