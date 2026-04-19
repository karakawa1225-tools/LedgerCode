/** Topページ用のやわらかいイラスト（SVG） */

export function IllustrationHero({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <ellipse cx="160" cy="200" rx="120" ry="12" fill="url(#hero-glow)" opacity="0.35" />
      <defs>
        <linearGradient id="hero-glow" x1="40" y1="200" x2="280" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="doc-face" x1="100" y1="60" x2="220" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecfeff" />
          <stop offset="1" stopColor="#cffafe" />
        </linearGradient>
      </defs>
      {/* 書類 */}
      <rect x="85" y="45" width="150" height="110" rx="12" fill="url(#doc-face)" stroke="#06b6d4" strokeWidth="2" />
      <path d="M105 75h110M105 95h80M105 115h95" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
      {/* 笑顔マーク */}
      <circle cx="135" cy="135" r="6" fill="#0e7490" />
      <circle cx="185" cy="135" r="6" fill="#0e7490" />
      <path
        d="M130 152c10 10 30 10 40 0"
        stroke="#0e7490"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* バーコード装飾 */}
      <rect x="115" y="165" width="90" height="28" rx="4" fill="#fff" stroke="#2dd4bf" strokeWidth="1.5" />
      {[0, 6, 11, 15, 22, 28, 33, 38, 44, 50, 56, 62, 68, 74].map((x, i) => (
        <rect key={i} x={118 + x} y="170" width={i % 3 === 0 ? 3 : 2} height="18" fill="#0d9488" rx="0.5" />
      ))}
      {/* 星・ハート装飾 */}
      <path
        d="M260 50l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z"
        fill="#fde68a"
        stroke="#f59e0b"
        strokeWidth="1"
      />
      <circle cx="55" cy="70" r="18" fill="#a5f3fc" opacity="0.8" />
      <path
        d="M48 70l5 5 12-14"
        stroke="#0e7490"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IllustrationStep1({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <rect x="12" y="18" width="56" height="44" rx="8" fill="#ecfeff" stroke="#06b6d4" strokeWidth="2" />
      <path d="M24 32h32M24 42h24" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="58" r="10" fill="url(#s1)" />
      <defs>
        <linearGradient id="s1" x1="30" y1="48" x2="50" y2="68">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <text x="40" y="65" textAnchor="middle" fontSize="14" fill="white" fontFamily="system-ui,sans-serif" fontWeight="700">
        1
      </text>
    </svg>
  );
}

export function IllustrationStep2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <rect x="10" y="22" width="60" height="36" rx="6" fill="#fff" stroke="#14b8a6" strokeWidth="2" />
      {[0, 5, 9, 14, 18, 24, 30, 35, 40, 46].map((x, i) => (
        <rect key={i} x={16 + x} y="32" width={i % 4 === 0 ? 2.5 : 1.8} height="16" fill="#0d9488" />
      ))}
      <path
        d="M28 58h24"
        stroke="url(#s2)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="s2" x1="28" y1="58" x2="52" y2="58">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IllustrationStep3({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <rect x="14" y="16" width="52" height="48" rx="6" fill="#f0fdfa" stroke="#2dd4bf" strokeWidth="2" />
      <path d="M24 28h32M24 38h28M24 48h20" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="62" r="8" fill="#34d399" opacity="0.9" />
      <path d="M36 62l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IllustrationStep4({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden>
      <rect x="18" y="12" width="44" height="56" rx="4" fill="#fff" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="22" y="20" width="36" height="28" rx="2" fill="#e0f2fe" />
      <path d="M26 44h28M26 50h20" stroke="#bae6fd" strokeWidth="2" />
      <rect x="24" y="54" width="32" height="8" rx="2" fill="url(#s4)" />
      <defs>
        <linearGradient id="s4" x1="24" y1="54" x2="56" y2="62">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
