import { AppShell } from "@/components/layout/AppShell";
import { getFixture } from "@/lib/service/competition.service";
import { ResultsClient } from "@/components/results/results-client";

export default async function ResultsPage() {
  const matches = await getFixture();
  return <AppShell><ResultsClient matches={matches} /></AppShell>;
}
