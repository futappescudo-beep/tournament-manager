import { NextResponse } from "next/server";
import { createTeam } from "@/services/teams/create-team";

export async function POST(request: Request) {
  try {
    const team = await createTeam(await request.json());
    return NextResponse.json({ success: true, team }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo crear el equipo." }, { status: 400 });
  }
}
