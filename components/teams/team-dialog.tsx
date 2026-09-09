"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TeamForm from "./team-form";
import type { TeamDialogProps } from "@/lib/types/team";

export function TeamDialog({ open, onOpenChange, categories, team, loading = false, onSave }: TeamDialogProps) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{team ? "Editar equipo" : "Nuevo equipo"}</DialogTitle><DialogDescription>Completa la informacion del equipo y sus inscripciones.</DialogDescription></DialogHeader>
      <TeamForm team={team} categories={categories} loading={loading} onSubmit={onSave} />
    </DialogContent>
  </Dialog>;
}
