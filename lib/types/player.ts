export type Player = {
  id: string;
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  photo_url: string | null;
  current_assignment: PlayerAssignment | null;
};

export type PlayerAssignment = {
  id: string;
  team_registration_id: string;
  shirt_number: number;
  is_captain: boolean;
  is_goalkeeper: boolean;
  label: string;
};

export type TeamRegistrationOption = {
  id: string;
  label: string;
};
