"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, UsersRound } from "lucide-react";
import type { Player, PlayerAssignment, TeamRegistrationOption } from "@/lib/types/player";
import { assignPlayerToTeam, createPlayer, deletePlayer, updatePlayer } from "@/lib/actions/players";
import type { PlayerAssignmentValues, PlayerCreateValues } from "@/lib/validations/players";
import { PlayerDialog } from "./players-dialog";
import { PlayerAssignmentDialog } from "./player-assignment-dialog";

export function PlayersClient({ players: initialPlayers, teamRegistrations, initialTeamRegistrationId }: { players: Player[]; teamRegistrations: TeamRegistrationOption[]; initialTeamRegistrationId?: string }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const [open, setOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const filtered = useMemo(() => players.filter((player) => `${player.first_name} ${player.last_name} ${player.document_number}`.toLowerCase().includes(query.toLowerCase())), [players, query]);

  async function save(values: PlayerCreateValues) {
    setLoading(true);
    try {
      if (selected) {
        const { team_registration_id, shirt_number, is_captain, is_goalkeeper, ...playerValues } = values;
        await updatePlayer(selected.id, playerValues);
        setPlayers((current) => current.map((player) => player.id === selected.id ? { ...player, ...playerValues, birth_date: playerValues.birth_date || null } : player));
      } else {
        const { team_registration_id, shirt_number, is_captain, is_goalkeeper, ...playerValues } = values;
        const created = await createPlayer(playerValues);
        const assignments: PlayerAssignment[] = [];
        if (team_registration_id) {
          await assignPlayerToTeam({ player_id: created.id, team_registration_id, shirt_number, is_captain, is_goalkeeper });
          const label = teamRegistrations.find((item) => item.id === team_registration_id)?.label ?? "Equipo asignado";
          assignments.push({ id: "new", team_registration_id, shirt_number, is_captain, is_goalkeeper, label });
        }
        setPlayers((current) => [...current, { ...(created as Player), assignments }].sort((a, b) => a.last_name.localeCompare(b.last_name)));
      }
      setOpen(false);
      setSelected(null);
    } finally { setLoading(false); }
  }

  async function saveAssignment(values: PlayerAssignmentValues) {
    setLoading(true);
    try {
      await assignPlayerToTeam(values);
      const label = teamRegistrations.find((item) => item.id === values.team_registration_id)?.label ?? "Equipo asignado";
      setPlayers((current) => current.map((player) => player.id === values.player_id ? { ...player, assignments: [...player.assignments.filter((assignment) => assignment.team_registration_id !== values.team_registration_id), { id: "new", team_registration_id: values.team_registration_id, shirt_number: values.shirt_number, is_captain: values.is_captain, is_goalkeeper: values.is_goalkeeper, label }] } : player));
      setAssignmentOpen(false);
    } finally { setLoading(false); }
  }

  async function remove(player: Player) {
    if (!window.confirm(`¿Eliminar a ${player.first_name} ${player.last_name}? Se quitará de las listas activas, pero se conservará el historial.`)) return;
    setLoading(true);
    try {
      await deletePlayer(player.id);
      setPlayers((current) => current.filter((item) => item.id !== player.id));
    } finally { setLoading(false); }
  }

  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">LISTAS DE BUENA FE</p><h1 className="mt-1 text-3xl text-white">Jugadores</h1><p className="mt-1 text-sm text-stone-400">Registra y consulta los jugadores del torneo.</p></div><button onClick={() => { setSelected(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#b71920,#77080d)] px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} />Nuevo jugador</button></div>
    <section className="ea-panel overflow-hidden rounded-lg"><div className="border-b border-[var(--ea-border)] p-4"><label className="relative block max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-stone-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o documento..." className="h-10 w-full pl-9 pr-3 text-sm" /></label></div>{filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-sm"><thead className="border-b border-[var(--ea-border)] text-left text-xs uppercase tracking-wider text-stone-500"><tr><th className="p-4">Jugador</th><th>Documento</th><th>Nacimiento</th><th>Equipos y zonas</th><th className="p-4 text-right">Acciones</th></tr></thead><tbody>{filtered.map((player) => <tr key={player.id} className="border-b border-[var(--ea-border)]/70"><td className="p-4 font-semibold text-white">{player.last_name}, {player.first_name}</td><td>{player.document_type} {player.document_number}</td><td className="text-stone-400">{player.birth_date ? new Date(`${player.birth_date}T00:00:00`).toLocaleDateString("es-AR") : "–"}</td><td className="max-w-80 text-stone-300">{player.assignments.length ? player.assignments.map((assignment) => <p key={assignment.team_registration_id}>{assignment.label} <span className="text-stone-500">· #{assignment.shirt_number}</span></p>) : "Sin asignar"}</td><td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => { setSelected(player); setAssignmentOpen(true); }} className="inline-flex items-center gap-1 rounded border border-[var(--ea-border)] px-2 py-1.5 text-xs text-[var(--ea-gold-soft)] hover:bg-white/5"><UsersRound size={14} />Equipo</button><button onClick={() => { setSelected(player); setOpen(true); }} aria-label={`Editar ${player.first_name}`} className="rounded border border-[var(--ea-border)] p-1.5 text-stone-300 hover:text-[var(--ea-gold)]"><Pencil size={15} /></button><button disabled={loading} onClick={() => remove(player)} aria-label={`Eliminar ${player.first_name}`} className="rounded border border-red-900/70 p-1.5 text-red-300 hover:bg-red-950/40 disabled:opacity-50"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <p className="py-12 text-center text-sm text-stone-500">No se encontraron jugadores.</p>}</section>
    <PlayerDialog open={open} onOpenChange={setOpen} player={selected} teamRegistrations={teamRegistrations} initialTeamRegistrationId={initialTeamRegistrationId} loading={loading} onSave={save} />
    <PlayerAssignmentDialog open={assignmentOpen} onOpenChange={setAssignmentOpen} player={selected} teamRegistrations={teamRegistrations} loading={loading} onSave={saveAssignment} />
  </div>;
}
