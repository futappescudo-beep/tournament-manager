import { AppShell } from "@/components/layout/AppShell";
import { PlayersClient } from "@/components/players/players-client";
import { getPlayers } from "@/lib/service/player.service";
import { getTeamRegistrationOptions } from "@/lib/service/player.service";

export default async function PlayersPage() {
  const [players, teamRegistrations] = await Promise.all([getPlayers(), getTeamRegistrationOptions()]);
  return <AppShell><PlayersClient players={players} teamRegistrations={teamRegistrations} /></AppShell>;
}
