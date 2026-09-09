"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  filter: string;
  setFilter: (value: string) => void;
  onNew: () => void;
}

export function TeamToolbar({
  filter,
  setFilter,
  onNew,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Input
        placeholder="Buscar equipo..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <Button onClick={onNew}>
        <Plus className="mr-2 h-4 w-4" />

        Nuevo equipo
      </Button>
    </div>
  );
}