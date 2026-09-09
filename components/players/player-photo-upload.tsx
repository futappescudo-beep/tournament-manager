"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function PlayerPhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) { if (!file) return; if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { toast.error("Elegí una foto JPG, PNG o WebP de hasta 2 MB."); return; } setUploading(true); try { const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg"; const path = `photos/${crypto.randomUUID()}.${extension.toLowerCase()}`; const supabase = createClient(); const { error } = await supabase.storage.from("player-photos").upload(path, file, { contentType: file.type }); if (error) throw error; onChange(supabase.storage.from("player-photos").getPublicUrl(path).data.publicUrl); toast.success("Foto cargada."); } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cargar la foto."); } finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; } }
  return <div className="flex items-center gap-3"><div className="grid h-16 w-16 overflow-hidden rounded-full border border-[var(--ea-gold)]/50 bg-black/20 place-items-center">{value ? <img src={value} alt="Foto del jugador" className="h-full w-full object-cover" /> : <Camera className="text-stone-500" />}</div><div><input ref={inputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])} /><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="rounded-md border border-[var(--ea-gold)]/60 px-3 py-2 text-sm font-semibold text-[var(--ea-gold)] disabled:opacity-50">{uploading ? "Cargando..." : "Subir foto"}</button><p className="mt-1 text-xs text-stone-500">JPG, PNG o WebP · hasta 2 MB</p></div></div>;
}
