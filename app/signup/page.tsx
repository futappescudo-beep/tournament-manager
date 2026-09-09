"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) { setError("La contrasena debe tener al menos 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contrasenas no coinciden."); return; }
    setLoading(true);
    const { error: signUpError } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login`, data: { first_name: firstName, last_name: lastName } },
    });
    if (signUpError) setError(signUpError.message);
    else setMessage("Cuenta creada. Revisa tu correo para confirmar la direccion antes de ingresar.");
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#571012,transparent_34rem),#090a0a] p-6">
    <section className="w-full max-w-md rounded-xl border border-[var(--ea-border)] bg-[#121313]/95 p-8 shadow-2xl shadow-black/40">
      <p className="text-xs font-bold tracking-[0.2em] text-[var(--ea-gold)]">ESCUDO AMISTAD</p>
      <h1 className="mt-3 text-4xl text-white">Crear cuenta</h1>
      <p className="mt-2 text-sm text-stone-400">Crea tu acceso inicial a la administracion.</p>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-sm font-medium">Nombre<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label><label className="grid gap-1 text-sm font-medium">Apellido<input required value={lastName} onChange={(event) => setLastName(event.target.value)} /></label></div>
        <label className="grid gap-1 text-sm font-medium">Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Contrasena<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Repetir contrasena<input type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
        {error && <p role="alert" className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        {message && <p className="rounded-md border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-200">{message}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] p-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60">{loading ? "Creando..." : "Crear cuenta"}</button>
        <p className="pt-2 text-center text-sm text-stone-400">Ya tenes cuenta? <Link href="/login" className="font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Ingresar</Link></p>
      </form>
    </section>
  </main>;
}
