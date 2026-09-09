import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MatchEventsClient } from "@/components/matches/match-events-client";
import { getMatchReport } from "@/lib/service/competition.service";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const report = await getMatchReport(id);
    return <AppShell><MatchEventsClient report={report} /></AppShell>;
  } catch { notFound(); }
}
