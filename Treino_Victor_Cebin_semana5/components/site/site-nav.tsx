"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Dumbbell, LibraryBig, LayoutDashboard, CalendarDays } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/plan", label: "Plano (semana 5→8)", icon: CalendarDays },
  { href: "/exercises", label: "Exercícios", icon: LibraryBig },
  { href: "/stats", label: "Stats", icon: BarChart3 },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
              active
                ? "border-transparent bg-secondary text-secondary-foreground"
                : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card">
        <Dumbbell className="size-4" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold">Treino — Victor Cebin</div>
        <div className="text-xs text-muted-foreground">Prescrição: Fisioterapeuta Vitor Vaz</div>
      </div>
    </Link>
  );
}


