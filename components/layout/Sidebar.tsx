"use client";

import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  Settings,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { Logo } from "./logo";
import { SidebarItem } from "./sidebar-item";

const menu = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/teams",
    icon: Shield,
    label: "Equipos",
  },
  {
    href: "/players",
    icon: Users,
    label: "Jugadores",
  },
  {
    href: "/matches",
    icon: CalendarDays,
    label: "Fixture",
  },
  {
    href: "/results",
    icon: ClipboardCheck,
    label: "Resultados",
  },
  {
    href: "/standings",
    icon: Trophy,
    label: "Posiciones",
  },
  {
    href: "/sanctions",
    icon: ShieldAlert,
    label: "Sanciones",
  },
  {
    href: "/payments",
    icon: Wallet,
    label: "Pagos",
  },
  {
    href: "/rules",
    icon: FileText,
    label: "Reglamento",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Configuración",
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--ea-border)] bg-[linear-gradient(180deg,#0b0c0c,#11100f)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--ea-border)] p-6">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {menu.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}
