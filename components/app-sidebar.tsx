"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  IconClose,
  IconFolderPlus,
  IconFolders,
  IconHome,
  IconImport,
  IconIssue,
  IconList,
  IconMenu,
  IconTop,
} from "@/components/nav-icons";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const nav: NavItem[] = [
  { href: "/", label: "Top", Icon: IconTop },
  { href: "/home", label: "ホーム", Icon: IconHome },
  { href: "/issued", label: "一覧・PDF", Icon: IconList },
  { href: "/import", label: "CSV取込", Icon: IconImport },
  { href: "/issue", label: "コード発行", Icon: IconIssue },
  { href: "/categories/new", label: "カテゴリー新規", Icon: IconFolderPlus },
  { href: "/categories", label: "カテゴリー管理", Icon: IconFolders },
];

function navActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/categories") return pathname === "/categories";
  if (href === "/issued") return pathname === "/issued";
  if (href === "/import") return pathname === "/import";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const btnBase =
  "flex w-full min-w-0 items-center gap-3 rounded-[10px] px-4 py-3 text-left text-sm font-medium text-white shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/90";

const btnIdle =
  "bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-600 hover:from-cyan-400 hover:via-sky-400 hover:to-teal-500 active:scale-[0.99]";

const btnActive =
  "bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-400 text-slate-900 shadow-lg ring-2 ring-white/70 ring-offset-2 ring-offset-slate-900";

export function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const NavLinks = (
    <nav className="flex flex-col gap-2.5">
      {nav.map(({ href, label, Icon }) => {
        const active = navActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`${btnBase} ${active ? btnActive : btnIdle}`}
            onClick={() => setOpen(false)}
          >
            <Icon className="h-6 w-6 shrink-0 opacity-95" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-[10px] bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg md:hidden"
        aria-label="メニューを開く"
      >
        <IconMenu className="h-6 w-6" />
      </button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm md:hidden"
          aria-label="メニューを閉じる"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`
          fixed left-0 top-0 z-[80] flex h-full min-h-screen w-[min(18rem,88vw)] flex-col border-r border-cyan-500/20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 pt-16 shadow-xl transition-transform duration-200 ease-out md:static md:z-0 md:w-64 md:min-w-[16rem] md:translate-x-0 md:pt-4 md:shadow-none
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="mb-4 flex items-center justify-between gap-2 md:justify-start">
          <Link
            href="/"
            className="truncate text-base font-semibold tracking-tight text-cyan-100"
            onClick={() => setOpen(false)}
          >
            コード管理
          </Link>
          <button
            type="button"
            className="rounded-[10px] p-2 text-cyan-200 hover:bg-white/10 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">{NavLinks}</div>
      </aside>
    </>
  );
}
