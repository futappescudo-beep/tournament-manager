import { AppShell } from "@/components/layout/AppShell";
import { TournamentSettingsClient } from "@/components/settings/tournament-settings-client";
import { getTournamentSetup } from "@/lib/service/settings.service";

export default async function SettingsPage() {
  const setup = await getTournamentSetup();
  return <AppShell><TournamentSettingsClient {...setup} /></AppShell>;
}
