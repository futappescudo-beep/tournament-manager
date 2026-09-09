"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; } if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; } setLoading(true); const { error: updateError } = await createClient().auth.updateUser({ password }); if (updateError) { setError("El enlace venció o no es válido. Solicitá uno nuevo."); setLoading(false); return; } router.replace("/dashboard"); router.refresh(); }
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#571012,transparent_34rem),#090a0a] p-6"><section className="w-full max-w-md rounded-xl border border-[var(--ea-border)] bg-[#121313]/95 p-8 shadow-2xl shadow-black/40"><p className="text-xs font-bold tracking-[0.2em] text-[var(--ea-gold)]">ESCUDO AMISTAD</p><h1 className="mt-3 text-4xl text-white">Nueva contraseña</h1><p className="mt-2 text-sm text-stone-400">Elegí una contraseña nueva para tu cuenta.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="grid gap-1 text-sm font-medium">Nueva contraseña<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><label className="grid gap-1 text-sm font-medium">Repetir contraseña<input type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>{error && <p role="alert" className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}<button disabled={loading} className="w-full rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] p-3 font-semibold text-white disabled:opacity-60">{loading ? "Guardando..." : "Guardar contraseña"}</button></form><p className="pt-5 text-center text-sm text-stone-400"><Link href="/forgot-password" className="font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Pedir otro enlace</Link></p></section></main>;
}
