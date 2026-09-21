import { AppShell } from "@/components/layout/AppShell";
import { PlayersClient } from "@/components/players/players-client";
import { getPlayers } from "@/lib/service/player.service";
import { getTeamRegistrationOptions } from "@/lib/service/player.service";
import { requireRoleAccess } from "@/lib/auth/access";

export default async function PlayersPage() {
  await requireRoleAccess(["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER"]);
  const [players, teamRegistrations] = await Promise.all([getPlayers(), getTeamRegistrationOptions()]);
  return <AppShell><PlayersClient players={players} teamRegistrations={teamRegistrations} /></AppShell>;
}
