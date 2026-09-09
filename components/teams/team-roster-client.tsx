"use client";

import { useState } from "react";
import { UserPlus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { assignPlayerToTeam } from "@/lib/actions/players";

type RosterEntry = { id: string; shirt_number: number; is_captain: boolean; is_goalkeeper: boolean; team_registration_id: string; players: { first_name: string; last_name: string; document_number: string; photo_url: string | null } | null };
type Registration = { id: string; label: string };

type AvailablePlayer = { id: string; first_name: string; last_name: string; document_number: string };

export function TeamRosterClient({ players, registrations, availablePlayers }: { players: RosterEntry[]; registrations: Registration[]; availablePlayers: AvailablePlayer[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const labels = new Map(registrations.map((registration) => [registration.id, registration.label]));
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setLoading(true); try { await assignPlayerToTeam({ player_id: String(form.get("playerId")), team_registration_id: registrations[0]?.id ?? "", shirt_number: 1, is_captain: false, is_goalkeeper: false }); toast.success("Jugador asignado al plantel."); setOpen(false); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo asignar el jugador."); } finally { setLoading(false); } }
  return <><section className="ea-panel overflow-hidden rounded-lg">{players.length ? <div className="divide-y divide-[var(--ea-border)]">{players.map((entry) => <article key={entry.id} className="flex items-center gap-4 p-4">{entry.players?.photo_url ? <img src={entry.players.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <UserRound className="h-8 w-8 text-stone-500" />}<div><p className="font-semibold">{entry.players?.first_name} {entry.players?.last_name}</p><p className="text-xs text-stone-500">DNI: {entry.players?.document_number} · {labels.get(entry.team_registration_id) ?? "Equipo"}</p></div></article>)}</div> : <div className="grid min-h-60 place-items-center p-8 text-center"><div><p className="text-sm text-stone-400">Todavía no hay jugadores asignados a este equipo.</p><button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white"><UserPlus size={16} />Asignar jugador existente</button></div></div>}</section>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-[var(--ea-border)] bg-[#121313] p-6 shadow-2xl"><h2 className="text-xl font-bold text-white">Asignar jugador al plantel</h2><p className="mt-2 text-sm text-stone-400">Elegí un jugador existente para este equipo.</p><div className="mt-5 space-y-4"><label className="grid gap-2 text-sm font-medium">Jugador<select required name="playerId" defaultValue=""><option value="" disabled>Seleccionar jugador</option>{availablePlayers.map((player) => <option key={player.id} value={player.id}>{player.last_name}, {player.first_name} · {player.document_number}</option>)}</select></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-md border border-[var(--ea-border)] px-4 py-2 text-sm">Cancelar</button><button disabled={loading || !availablePlayers.length || !registrations.length} className="rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Asignando..." : "Asignar jugador"}</button></div></form></div>}</>;
}
