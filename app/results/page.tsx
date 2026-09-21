import { AppShell } from "@/components/layout/AppShell";
import { canManageFixture, getFixture } from "@/lib/service/competition.service";
import { ResultsClient } from "@/components/results/results-client";

export default async function ResultsPage() {
  const [matches, canEdit] = await Promise.all([getFixture(), canManageFixture()]);
  return <AppShell><ResultsClient matches={matches} canEdit={canEdit} /></AppShell>;
}
