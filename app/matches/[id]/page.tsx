import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MatchEventsClient } from "@/components/matches/match-events-client";
import { getMatchReport } from "@/lib/service/competition.service";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = await getMatchReport(id);
    return <AppShell><MatchEventsClient report={report} /></AppShell>;
  } catch (error) {
    console.error("match-sheet-load-failed", error);
    return <AppShell><section className="mx-auto max-w-xl ea-panel rounded-lg p-6 text-center"><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">PLANILLA DIGITAL</p><h1 className="mt-2 text-2xl text-white">No se pudo abrir la planilla</h1><p className="mt-3 text-sm text-stone-400">Verificá que el partido exista y que la migración <code className="text-[var(--ea-gold-soft)]">20260916_digital_match_sheet.sql</code> esté ejecutada en el proyecto de Supabase conectado a esta aplicación.</p><Link href="/matches" className="mt-5 inline-flex rounded-md border border-[var(--ea-gold)]/50 px-4 py-2 text-sm font-bold text-[var(--ea-gold-soft)]">Volver al fixture</Link></section></AppShell>;
  }
}
