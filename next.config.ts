import type { NextConfig } from "next";

/** GitHub Pages のプロジェクトサイト用（例: /LedgerCode）。ローカルでは未設定のまま。 */
const basePath =
  process.env.BASE_PATH && process.env.BASE_PATH.length > 0
    ? process.env.BASE_PATH
    : undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
};

export default nextConfig;
