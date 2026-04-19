import type { ReactNode } from "react";

export function PageFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
