import { createClient } from "@/lib/supabase/client";

export async function uploadMatchSheet(
  matchId: string,
  file: File,
) {
  const supabase = createClient();

  const fileExtension = file.name
    .split(".")
    .pop();

  const filePath =
    `matches/${matchId}/${crypto.randomUUID()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from("match-sheets")
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
    .from("match-sheets")
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  };
}