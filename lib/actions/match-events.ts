"use server";

import { revalidatePath } from "next/cache";
import { matchEventSchema, matchEventUpdateSchema, matchSheetCancelSchema, matchSheetConfirmationSchema, matchSheetEntrySchema, matchSheetFinishSchema, matchSheetStatusSchema, type MatchEventValues, type MatchEventUpdateValues, type MatchSheetConfirmationValues, type MatchSheetEntryValues, type MatchSheetStatusValues } from "@/lib/validations/match-events";
import { cancelDraftMatchSheet, createMatchEvent, confirmMatchSheet, finishMatchSheet as finishMatchSheetService, saveMatchSheetEntry, setMatchSheetStatus, updateMatchEvent } from "@/lib/service/competition.service";

export async function saveMatchEvent(values: MatchEventValues) {
  const event = matchEventSchema.parse(values);
  await createMatchEvent(event);
  revalidatePath(`/matches/${event.matchId}`);
  revalidatePath("/scorers");
  revalidatePath("/sanctions");
}

export async function updateSheetEvent(values: MatchEventUpdateValues) {
  const event = matchEventUpdateSchema.parse(values);
  await updateMatchEvent(event);
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

export async function cancelPreliminarySheet(values: { matchId: string }) {
  const sheet = matchSheetCancelSchema.parse(values);
  await cancelDraftMatchSheet(sheet.matchId);
  revalidatePath(`/matches/${sheet.matchId}`);
  revalidatePath("/matches");
}

export async function finishMatchSheet(values: { matchId: string }) {
  const sheet = matchSheetFinishSchema.parse(values);
  await finishMatchSheetService(sheet.matchId);
  revalidatePath(`/matches/${sheet.matchId}`);
}
