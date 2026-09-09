"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { Team } from "@/lib/types/team";

interface DeleteTeamDialogProps {
  open: boolean;
  team: Team |null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function DeleteTeamDialog({
  open,
  team,
  loading,
  onOpenChange,
  onConfirm,
}: DeleteTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Eliminar equipo</DialogTitle>

          <DialogDescription>
            ¿Está seguro que desea eliminar el equipo{" "}
            <strong>{team?.name}</strong>?
            <br />
            <br />
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            disabled={loading}
            onClick={onConfirm}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}