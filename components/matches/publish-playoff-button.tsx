"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { publishPlayoffBracket } from "@/lib/actions/playoffs";

export function PublishPlayoffButton({ bracketId }: { bracketId: string }) {
  const [loading, setLoading] = useState(false);
  async function publish() {
    setLoading(true);
    try {
      const result = await publishPlayoffBracket(bracketId);
      toast.success(result.created ? `${result.created} partido(s) de Play Off publicado(s).` : "No había cruces completos para publicar todavía.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo publicar el cuadro.");
    } finally { setLoading(false); }
  }
  return <button type="button" onClick={publish} disabled={loading} className="inline-flex items-center gap-1 rounded border border-[var(--ea-gold)]/50 px-2 py-1 text-xs font-semibold text-[var(--ea-gold)] hover:bg-[var(--ea-gold)]/10 disabled:opacity-50"><Send size={13} />{loading ? "Publicando…" : "Publicar cruces"}</button>;
}
