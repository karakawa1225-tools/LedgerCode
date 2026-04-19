export type Category = {
  id: string;
  label: string;
  /** 英小文字ちょうど5文字 */
  prefix: string;
  /** 備考（自由記述） */
  notes: string;
};

export type IssuedRow = {
  /** 生成された13桁のコード */
  codeId: string;
  itemName: string;
};

/** 組み込みカテゴリ（削除不可）のプレフィックス */
export const BUILTIN_PREFIXES = new Set(["custm", "suppl", "accnt"]);

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-custm", label: "顧客管理", prefix: "custm", notes: "組み込み" },
  { id: "cat-suppl", label: "仕入先管理", prefix: "suppl", notes: "組み込み" },
  { id: "cat-accnt", label: "勘定科目", prefix: "accnt", notes: "組み込み" },
];

export function isValidPrefix(value: string): boolean {
  return /^[a-z]{5}$/.test(value);
}

export function formatSerial(n: number): string {
  const clamped = Math.min(Math.max(Math.floor(n), 1), 999);
  return String(clamped).padStart(3, "0");
}

/** 指定桁のランダムな数字列（先頭も0になり得る） */
export function randomNumericString(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += (bytes[i] % 10).toString();
  }
  return out;
}

export function buildCodeId(prefix: string, serial: number): string {
  return `${prefix}${formatSerial(serial)}${randomNumericString(5)}`;
}

/** 生成ID（13文字）から連番部分（3桁）を取り出す */
export function serialFromCodeId(codeId: string): number | null {
  if (codeId.length !== 13) return null;
  const serialStr = codeId.slice(5, 8);
  if (!/^\d{3}$/.test(serialStr)) return null;
  const n = Number.parseInt(serialStr, 10);
  return n >= 1 && n <= 999 ? n : null;
}

/** 追加カテゴリ用：既存と重複しない5文字プレフィックス */
export function proposeUniquePrefix(taken: Set<string>): string {
  const pool = [
    "nvtry",
    "astmt",
    "evntp",
    "prjct",
    "fstck",
    "blncs",
    "xactn",
    "itmky",
    "phsfd",
    "rqest",
  ];
  for (const p of pool) {
    if (!taken.has(p)) return p;
  }
  for (let attempt = 0; attempt < 200; attempt++) {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    let s = "";
    for (let i = 0; i < 5; i++) {
      s += String.fromCharCode(97 + (bytes[i] % 26));
    }
    if (!taken.has(s)) return s;
  }
  throw new Error("ユニークなプレフィックスを生成できませんでした");
}
