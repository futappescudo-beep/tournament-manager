"use client";

import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  Goal,
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
    label: "Principal",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/teams",
    icon: Shield,
    label: "Equipos",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER"],
  },
  {
    href: "/players",
    icon: Users,
    label: "Jugadores",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER"],
  },
  {
    href: "/matches",
    icon: CalendarDays,
    label: "Fixture",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/results",
    icon: ClipboardCheck,
    label: "Resultados",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/standings",
    icon: Trophy,
    label: "Posiciones",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/scorers",
    icon: Goal,
    label: "Goleadores",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/sanctions",
    icon: ShieldAlert,
    label: "Sanciones",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/payments",
    icon: Wallet,
    label: "Pagos",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE"],
  },
  {
    href: "/rules",
    icon: FileText,
    label: "Reglamento",
    roles: ["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER", "REFEREE", "PLAYER"],
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Configuración",
    roles: ["SUPER_ADMIN"],
  },
];

export function Sidebar({ role }: { role: string }) {
  const visibleMenu = menu.filter((item) => item.roles.includes(role));
  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--ea-border)] bg-[linear-gradient(180deg,#0b0c0c,#11100f)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--ea-border)] p-6">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {visibleMenu.map((item) => (
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
