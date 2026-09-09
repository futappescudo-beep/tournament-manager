"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  async function handleSignOut() { await createClient().auth.signOut(); router.replace("/login"); router.refresh(); }
  return <header className="flex min-h-16 items-center justify-between border-b border-[var(--ea-border)] bg-[#0e0f0f]/95 px-4 backdrop-blur md:px-6">
    <div><p className="ea-heading text-lg text-white">Dashboard</p><p className="text-[11px] uppercase tracking-[.14em] text-stone-500">Administracion de torneos</p></div>
    <div className="flex items-center gap-2 md:gap-4"><button aria-label="Notificaciones" className="relative rounded-md p-2 text-[var(--ea-gold)] hover:bg-white/5"><Bell size={19} /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600" /></button><div className="hidden border-l border-[var(--ea-border)] pl-4 text-right md:block"><p className="text-sm font-semibold">Administrador</p><p className="text-xs text-stone-500">Escudo Amistad</p></div><button onClick={handleSignOut} className="flex items-center gap-1 rounded-md border border-[var(--ea-border)] px-3 py-2 text-xs font-semibold text-stone-200 hover:border-[var(--ea-gold)] hover:text-[var(--ea-gold)]">Salir<ChevronDown size={14} /></button></div>
  </header>;
}
