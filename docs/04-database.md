# Modelo de Datos (MVP)

## Tablas

### profiles

* id (uuid, PK, referencia a auth.users)
* full_name
* role
* created_at

### tournaments

* id
* name
* season
* created_at

### teams

* id
* tournament_id
* name
* short_name
* logo_url
* created_at

### players

* id
* team_id
* first_name
* last_name
* dni
* birth_date
* jersey_number
* photo_url
* created_at

### matches

* id
* tournament_id
* round_number
* match_date
* venue
* home_team_id
* away_team_id
* home_score
* away_score
* status (scheduled, played, postponed)
* created_at

### goals

* id
* match_id
* player_id
* team_id
* minute

### cards

* id
* match_id
* player_id
* type (yellow, red)
* minute

### sanctions

* id
* player_id
* reason
* matches_suspended
* active

### documents

* id
* match_id
* file_url
* file_type
* uploaded_by
* created_at
