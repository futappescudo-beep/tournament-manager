import type { TeamFormValues } from "@/lib/validations/teams";

export interface ZoneOption { id: string; name: string; }
export interface CategoryOption { id: string; name: string; zones: ZoneOption[]; }

export interface TeamRegistration {
  id: string;
  category_id: string;
  zone_id: string;
  registration_status_id: string | null;
  categories: { id: string; name: string }[];
  zones: { id: string; name: string }[];
}

export interface Team {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  team_category_registrations: TeamRegistration[];
}

export interface TeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  team?: Team | null;
  loading?: boolean;
  onSave: (values: TeamFormValues) => Promise<void>;
}
