"use server";

import { revalidatePath } from "next/cache";
import { matchEventSchema, type MatchEventValues } from "@/lib/validations/match-events";
import { createMatchEvent } from "@/lib/service/competition.service";

export async function saveMatchEvent(values: MatchEventValues) {
  const event = matchEventSchema.parse(values);
  await createMatchEvent(event);
  revalidatePath(`/matches/${event.matchId}`);
  revalidatePath("/scorers");
  revalidatePath("/sanctions");
}
