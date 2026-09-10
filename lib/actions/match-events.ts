"use server";

import { revalidatePath } from "next/cache";
import { matchEventSchema, matchSheetConfirmationSchema, matchSheetEntrySchema, matchSheetStatusSchema, type MatchEventValues, type MatchSheetConfirmationValues, type MatchSheetEntryValues, type MatchSheetStatusValues } from "@/lib/validations/match-events";
import { createMatchEvent, confirmMatchSheet, saveMatchSheetEntry, setMatchSheetStatus } from "@/lib/service/competition.service";

export async function saveMatchEvent(values: MatchEventValues) {
  const event = matchEventSchema.parse(values);
  await createMatchEvent(event);
  revalidatePath(`/matches/${event.matchId}`);
  revalidatePath("/scorers");
  revalidatePath("/sanctions");
}

export async function saveSheetEntry(values: MatchSheetEntryValues) {
  const entry = matchSheetEntrySchema.parse(values);
  await saveMatchSheetEntry(entry);
  revalidatePath(`/matches/${entry.matchId}`);
}

export async function confirmSheet(values: MatchSheetConfirmationValues) {
  const confirmation = matchSheetConfirmationSchema.parse(values);
  await confirmMatchSheet(confirmation);
  revalidatePath(`/matches/${confirmation.matchId}`);
}

export async function setSheetStatus(values: MatchSheetStatusValues) {
  const sheet = matchSheetStatusSchema.parse(values);
  await setMatchSheetStatus(sheet);
  revalidatePath(`/matches/${sheet.matchId}`);
}
