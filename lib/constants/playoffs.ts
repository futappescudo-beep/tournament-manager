export const PLAYOFF_STAGES = [
  "Octavos de final",
  "Cuartos de final",
  "Semifinal",
  "Final",
] as const;

export type PlayoffStage = (typeof PLAYOFF_STAGES)[number];

export function normalizePlayoffStage(value: string): PlayoffStage | null {
  const normalized = value.trim().toLocaleLowerCase("es-AR");
  return PLAYOFF_STAGES.find((stage) => stage.toLocaleLowerCase("es-AR") === normalized) ?? null;
}
