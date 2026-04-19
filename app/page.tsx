import Link from "next/link";
import {
  IllustrationHero,
  IllustrationStep1,
  IllustrationStep2,
  IllustrationStep3,
  IllustrationStep4,
} from "@/components/top-illustrations";

const steps = [
  {
    title: "カテゴリーを用意",
    body: "「顧客」「仕入先」など、あらかじめ決めた分類を登録します。なくても初期の3種類が使えます。",
    Pic: IllustrationStep1,
  },
  {
    title: "コードを発行",
    body: "項目名（会社名など）を入力すると、自動で13桁の管理コードが付きます。まとめてならCSVもOK。",
    Pic: IllustrationStep2,
  },
  {
    title: "一覧で確認",
    body: "発行したコードは一覧で見られます。バーコード付きなので、そのままラベルイメージで確認できます。",
    Pic: IllustrationStep3,
  },
  {
    title: "PDFで保存・共有",
    body: "必要なときだけ、一覧表をA4のPDFにして印刷や共有ができます。",
    Pic: IllustrationStep4,
  },
] as const;

const sections: {
  heading: string;
  sub: string;
  items: { href: string; title: string; description: string; tag?: string }[];
}[] = [
  {
    heading: "まずはここから",
    sub: "今の発行数や一覧の入り口です",
    items: [
      {
        href: "/home",
        title: "ホーム（ダッシュボード）",
        description: "数字のサマリーと、発行済みの簡易一覧が見られます。",
        tag: "おすすめ",
      },
    ],
  },
  {
    heading: "管理コードを付ける",
    sub: "1件ずつでも、CSVでも",
    items: [
      {
        href: "/issue",
        title: "コード発行",
        description: "画面からカテゴリーと項目名を選んで、その場でコードを発行します。",
      },
      {
        href: "/import",
        title: "CSV一括取り込み",
        description: "表計算で作ったリストを読み込み、まとめてコードを付けられます。",
      },
    ],
  },
  {
    heading: "バーコードを見る・画像保存・PDFにする",
    sub: "PCにPNGやZIPで保存したり、印刷・共有はPDFで",
    items: [
      {
        href: "/issued",
        title: "発行一覧・バーコード・PDF",
        description:
          "カテゴリー別の一覧。バーコードをPNGで1件ずつ・ZIPでまとめて保存できます。A4のPDFもここから。",
      },
    ],
  },
  {
    heading: "カテゴリーの整理",
    sub: "名前の変更や、自分用の分類を足す",
    items: [
      {
        href: "/categories/new",
        title: "カテゴリー新規作成",
        description: "新しい分類を追加します。英字5文字のコードは自動でも指定でも。",
      },
      {
        href: "/categories",
        title: "カテゴリー管理",
        description: "登録済みの名前・備考の編集や、不要な分類の削除ができます。",
      },
    ],
  },
];

export default function TopPage() {
  return (
    <div className="min-h-full bg-gradient-to-b from-cyan-50/80 via-white to-teal-50/60 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-14">
        {/* ヒーロー */}
        <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          <IllustrationHero className="h-44 w-full max-w-[280px] shrink-0 sm:h-52 sm:max-w-[300px]" />
          <div className="max-w-xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              はじめてでも大丈夫
            </p>
            <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              管理コードを、
              <br className="sm:hidden" />
              かんたんに付けられるツール
            </h1>
            <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
              難しい設定はほぼありません。左のメニューから行きたい画面を選ぶだけです。
              このページでは、<strong className="font-semibold text-slate-800 dark:text-slate-100">全体の流れ</strong>
              と、よく使う画面への入口をまとめています。
            </p>
          </div>
        </header>

        {/* 流れ（絵付き） */}
        <section
          className="rounded-3xl border border-cyan-100/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-cyan-900/40 dark:bg-slate-900/80 sm:p-8"
          aria-labelledby="flow-heading"
        >
          <h2 id="flow-heading" className="text-lg font-bold text-slate-900 dark:text-white">
            かんたん4ステップ
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            次の順番だと迷いにくいです（順不同でも問題ありません）。
          </p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-cyan-50/50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/80"
              >
                <div className="flex shrink-0 flex-col items-center">
                  <s.Pic className="h-16 w-16 sm:h-20 sm:w-20" />
                  <span className="mt-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    STEP {i + 1}
                  </span>
                </div>
                <div className="min-w-0 pt-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ヒント */}
        <aside className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <span className="font-semibold">ひとことメモ</span>
          <span className="ml-1">
            データはこのブラウザに保存されます。別のPCでは共有されません。大切なときはPDFや一覧のスクリーンショットも併用してください。
          </span>
        </aside>

        {/* メニューへの案内 */}
        <section aria-labelledby="nav-heading">
          <h2 id="nav-heading" className="text-lg font-bold text-slate-900 dark:text-white">
            やりたいことから選ぶ
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            タップまたはクリックで、それぞれの画面へ進みます。
          </p>

          <div className="mt-6 flex flex-col gap-10">
            {sections.map((sec) => (
              <div key={sec.heading}>
                <h3 className="text-sm font-semibold text-teal-700 dark:text-teal-300">{sec.heading}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500">{sec.sub}</p>
                <ul className="mt-3 flex flex-col gap-3">
                  {sec.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex flex-col gap-1 rounded-[10px] border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-teal-700"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                            {item.title}
                          </span>
                          {item.tag ? (
                            <span className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {item.tag}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {item.description}
                        </span>
                        <span className="mt-1 text-xs font-medium text-teal-600 dark:text-teal-400">
                          この画面へ進む →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-200/80 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          左のメニューからも、いつでも同じ画面を開けます。
        </footer>
      </div>
    </div>
  );
}
