import { createClient } from "@/lib/supabase/client";

export async function uploadTeamAsset(
  teamId: string,
  file: File,
) {
  const supabase = createClient();

  const fileExtension = file.name
    .split(".")
    .pop();

  const filePath =
    `teams/${teamId}/${crypto.randomUUID()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("team-assets")
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
    .from("team-assets")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  };
}