"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
    if (resetError) setError("No pudimos enviar el correo. Intentá nuevamente.");
    else setSent(true);
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#571012,transparent_34rem),#090a0a] p-6"><section className="w-full max-w-md rounded-xl border border-[var(--ea-border)] bg-[#121313]/95 p-8 shadow-2xl shadow-black/40"><p className="text-xs font-bold tracking-[0.2em] text-[var(--ea-gold)]">ESCUDO AMISTAD</p><h1 className="mt-3 text-4xl text-white">Recuperar contraseña</h1><p className="mt-2 text-sm text-stone-400">Ingresá tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>{sent ? <div className="mt-7 rounded-md border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-200">Si existe una cuenta con ese correo, recibirás las instrucciones en unos minutos.</div> : <form onSubmit={submit} className="mt-7 space-y-4"><label className="grid gap-1 text-sm font-medium">Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p role="alert" className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] p-3 font-semibold text-white disabled:opacity-60">{loading ? "Enviando..." : "Enviar enlace"}</button></form>}<p className="pt-5 text-center text-sm text-stone-400"><Link href="/login" className="font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Volver a ingresar</Link></p></section></main>;
}
