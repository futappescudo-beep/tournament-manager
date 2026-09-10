"use server";

import { revalidatePath } from "next/cache";
import { createPlayoffBracket } from "@/lib/service/playoffs.service";
import { playoffBracketSchema, type PlayoffBracketValues } from "@/lib/validations/playoffs";

export async function savePlayoffBracket(values: PlayoffBracketValues) {
  await createPlayoffBracket(playoffBracketSchema.parse(values));
  revalidatePath("/matches");
  revalidatePath("/dashboard");
  revalidatePath("/standings");
}
