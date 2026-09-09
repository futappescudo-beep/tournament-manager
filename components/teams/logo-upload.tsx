"use client";

import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function LogoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { toast.error("Elegí una imagen JPG, PNG o WebP de hasta 2 MB."); return; }
    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "png";
      const path = `logos/${crypto.randomUUID()}.${extension.toLowerCase()}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("team-logos").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("team-logos").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Escudo cargado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo cargar el escudo."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }
  return <div className="flex items-center gap-3"><div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--ea-border)] bg-black/20">{value ? <img src={value} alt="Vista previa del escudo" className="h-full w-full object-contain p-1" /> : <ImageUp className="h-5 w-5 text-stone-500" />}</div><div><input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => upload(event.target.files?.[0])} /><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="rounded-md border border-[var(--ea-gold)]/60 px-3 py-2 text-sm font-semibold text-[var(--ea-gold)] disabled:opacity-50">{uploading ? "Cargando..." : "Subir escudo"}</button><p className="mt-1 text-xs text-stone-500">JPG, PNG o WebP · hasta 2 MB</p></div></div>;
}
