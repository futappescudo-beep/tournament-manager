"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Team } from "@/lib/types/team";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function createColumns({ onEdit, onDelete }: { onEdit: (team: Team) => void; onDelete: (team: Team) => void }): ColumnDef<Team>[] {
  return [
    { accessorKey: "name", header: "Equipo" },
    { accessorKey: "short_name", header: "Abreviatura", cell: ({ row }) => row.original.short_name || "-" },
    { accessorKey: "phone", header: "Telefono", cell: ({ row }) => row.original.phone || "-" },
    { accessorKey: "email", header: "Correo", cell: ({ row }) => row.original.email || "-" },
    { id: "roster", header: "Plantel", cell: ({ row }) => <Link href={`/teams/${row.original.id}`} className="text-sm font-semibold text-[var(--ea-gold)] hover:underline">Ver plantel</Link> },
    { accessorKey: "active", header: "Estado", cell: ({ row }) => row.original.active ? "Activo" : "Inactivo" },
    { id: "actions", enableSorting: false, enableHiding: false, cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}><Trash2 className="mr-2 h-4 w-4" />Dar de baja</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ];
}
