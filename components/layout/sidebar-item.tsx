"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
}: SidebarItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[linear-gradient(90deg,#a70d14,#78080d)] text-white shadow-[0_8px_20px_rgba(97,0,5,.35)]"
          : "text-stone-400 hover:bg-white/5 hover:text-[var(--ea-gold-soft)]",
      ].join(" ")}
    >
      <Icon
        size={20}
        className="transition-transform duration-200 group-hover:scale-110"
      />

      <span>{label}</span>
    </Link>
  );
}
