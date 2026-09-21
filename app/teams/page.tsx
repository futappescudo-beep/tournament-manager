import { TeamPageClient } from "@/components/teams/team-page-client";

import { getTeams } from "@/lib/service/team.service";
import { getCategoriesWithZones } from "@/lib/service/catalog.service";
import { requireUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { requireRoleAccess } from "@/lib/auth/access";

export default async function TeamsPage() {
  await requireUser();
  await requireRoleAccess(["SUPER_ADMIN", "TOURNAMENT_ADMIN", "TEAM_MANAGER"]);
  const [teams, categories] = await Promise.all([
    getTeams(),
    getCategoriesWithZones(),
  ]);

  return <AppShell>
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold tracking-[.18em] text-[var(--ea-gold)]">ADMINISTRACION</p>
        <h1 className="mt-1 text-3xl text-white">
          Equipos
        </h1>

        <p className="text-muted-foreground">
          Administración de equipos del torneo.
        </p>
      </div>

      <TeamPageClient
        teams={teams}
        categories={categories}
      />
    </div>
  </AppShell>;
}
