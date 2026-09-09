import { createClient } from "@/lib/supabase/client";

export async function uploadTournamentDocument(
  tournamentId: string,
  file: File,
) {
  const supabase = createClient();

  const fileExtension = file.name
    .split(".")
    .pop();

  const filePath =
    `tournaments/${tournamentId}/${crypto.randomUUID()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("tournament-documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("tournament-documents")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  };
}