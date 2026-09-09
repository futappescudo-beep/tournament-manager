import { teamSchema, type TeamFormValues } from "@/lib/validations/teams";
import { createTeam as persistTeam } from "@/lib/service/team.service";

export async function createTeam(input: TeamFormValues) {
  return persistTeam(teamSchema.parse(input));
}
