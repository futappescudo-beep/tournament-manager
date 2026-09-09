export type Tournament = {
  id: string
  name: string
  description: string | null
  season: string | null
  logo_url: string | null
  status: string
  start_date: string | null
  end_date: string | null
  max_players_per_team: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  tournament_id: string
  name: string
  code: string | null
  description: string | null
  min_age: number | null
  max_age: number | null
  is_active: boolean
  created_at: string
}

export type Zone = {
  id: string
  category_id: string
  name: string
  code: string | null
  max_teams: number | null
  created_at: string
}

export type Team = {
  id: string
  name: string
  short_name: string | null
  logo_url: string | null
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TeamCategoryRegistration = {
  id: string
  team_id: string
  category_id: string
  zone_id: string | null
}

export type Player = {
  id: string
  first_name: string
  last_name: string
  dni: string | null
  birth_date: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  shirt_number: number | null
  created_at: string
  updated_at: string
}

export type PlayerRegistration = {
  id: string
  player_id: string
  team_id: string
  category_id: string
  shirt_number: number | null
  registration_status: string
  registration_date: string
  created_at: string
}