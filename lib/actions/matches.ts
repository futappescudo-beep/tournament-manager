"use server";

import { revalidatePath } from "next/cache";
import { fixtureMatchSchema, regularFixtureGeneratorSchema, resultSchema, type FixtureMatchValues, type RegularFixtureGeneratorValues, type ResultValues } from "@/lib/validations/matches";
import { createFixtureMatch, generateRegularFixture, updateMatchResult } from "@/lib/service/competition.service";

export async function saveMatchResult(values: ResultValues) {
  const result = resultSchema.parse(values);
  await updateMatchResult(result);
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/results");
  revalidatePath("/standings");
}

export async function createManualFixtureMatch(values: FixtureMatchValues) {
  await createFixtureMatch(fixtureMatchSchema.parse(values));
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/results");
  revalidatePath("/standings");
  revalidatePath("/public");
}

export async function createRegularFixture(values: RegularFixtureGeneratorValues) {
  const result = await generateRegularFixture(regularFixtureGeneratorSchema.parse(values));
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  revalidatePath("/results");
  revalidatePath("/standings");
  revalidatePath("/public");
  return result;
}
