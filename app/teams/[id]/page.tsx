import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamRosterClient } from "@/components/teams/team-roster-client";
import { getTeamRoster } from "@/lib/service/team.service";
import { getPlayers } from "@/lib/service/player.service";

export default async function TeamRosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ team, registrations, players }, availablePlayers] = await Promise.all([getTeamRoster(id), getPlayers()]);
  return <AppShell><div className="space-y-6"><Link href="/teams" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ea-gold)]"><ArrowLeft size={16} />Volver a equipos</Link><div className="flex items-center gap-4">{team.logo_url ? <img src={team.logo_url} alt="" className="h-16 w-16 rounded-lg object-contain" /> : <div className="grid h-16 w-16 place-items-center rounded-lg border border-[var(--ea-gold)]/40"><UserRound className="text-[var(--ea-gold)]" /></div>}<div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">LISTA DE BUENA FE</p><h1 className="mt-1 text-3xl text-white">Plantel · {team.name}</h1><p className="mt-1 text-sm text-stone-400">{players.length} jugadores asignados actualmente.</p></div></div><TeamRosterClient players={players as never} registrations={registrations} availablePlayers={availablePlayers} /></div></AppShell>;
}
