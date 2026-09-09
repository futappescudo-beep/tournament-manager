"use client";

import { type FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message === "Invalid login credentials" ? "El correo electrónico o la contraseña son incorrectos." : "No se pudo iniciar sesión. Intentá nuevamente.");
      setLoading(false);
      return;
    }
    const destination = searchParams.get("next");
    router.replace(destination?.startsWith("/") ? destination : "/dashboard");
    router.refresh();
  }

  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,#571012,transparent_34rem),#090a0a] p-6">
    <section className="w-full max-w-md rounded-xl border border-[var(--ea-border)] bg-[#121313]/95 p-8 shadow-2xl shadow-black/40">
      <p className="text-xs font-bold tracking-[0.2em] text-[var(--ea-gold)]">ESCUDO AMISTAD</p>
      <h1 className="mt-3 text-4xl text-white">Ingresar</h1>
      <p className="mt-2 text-sm text-stone-400">Accede a la administracion del torneo.</p>
      <form onSubmit={handleLogin} className="mt-7 space-y-4">
        <label className="grid gap-1 text-sm font-medium">Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="grid gap-1 text-sm font-medium">Contrasena<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p role="alert" className="rounded-md border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] p-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60">{loading ? "Ingresando..." : "Ingresar"}</button>
        <p className="text-right text-sm"><Link href="/forgot-password" className="font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Olvidé mi contraseña</Link></p>
        <p className="pt-2 text-center text-sm text-stone-400">No tenes cuenta? <Link href="/signup" className="font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Crear cuenta</Link></p>
        <p className="text-center text-sm text-stone-400">Solo querés consultar el torneo? <Link href="/public" className="font-semibold text-[var(--ea-gold)] hover:text-[var(--ea-gold-soft)]">Ingresar como invitado</Link></p>
      </form>
    </section>
  </main>;
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#090a0a]" />}><LoginForm /></Suspense>;
}
