# JSON spec format

Input for `scripts/generate_session_sql.py`. It is the client's message turned
into plain data; all the interpreting (abbreviations, muscle groups, icons)
happens while writing it.

```json
{
  "session": {
    "name": "Pecho y brazo",
    "estimatedDurationMinutes": 80,
    "id": "optional-fixed-uuid"
  },
  "user": {
    "email": "client@example.com"
  },
  "masterDatabase": "master",
  "exercises": [
    {
      "name": "Press inclinado con barra",
      "type": "bilateral",
      "muscleGroups": ["Pecho", "Hombro", "Tríceps"],
      "icon": "benchIncline",
      "description": null,
      "note": null,
      "sets": [
        { "reps": 5, "weight": 27.5 },
        { "reps": 5, "weight": 27.5 },
        { "reps": 5, "weight": 25 }
      ]
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `session.name` | yes | 2-255 characters |
| `session.estimatedDurationMinutes` | no | defaults to `8 + 3 x total sets`, rounded to 5 |
| `session.id` | no | fixed UUID; handy to regenerate the same file |
| `user.email` | yes | unique in `master.user`; both the user and their tenant come from it |
| `masterDatabase` | no | defaults to `master` |
| `exercises[].name` | yes | full name in Spanish; reuse key against the library |
| `exercises[].type` | yes | `unilateral` \| `bilateral` |
| `exercises[].muscleGroups` | yes | >= 1, from the catalog in `schema.md` |
| `exercises[].icon` | no | from the catalog in `schema.md`; `null` makes the app draw `dumbbell` |
| `exercises[].description` | no | description of the exercise if the client gave cues |
| `exercises[].note` | no | note for that exercise inside the session (tempo, rests...) |
| `exercises[].sets[].reps` | yes | integer > 0 |
| `exercises[].sets[].weight` | no | number >= 0 or `null` (bodyweight / to failure) |

The order of the `exercises` array is the session `position` (1, 2, 3...), and
the order of `sets` is the `position` of each set.

Exercise names, muscle groups and the session name stay **in Spanish**: they are
data the client reads in the app, not code.

## What the generated SQL does

1. `SET @user_id` from `master.user` by email, demanding `tenant_id = DATABASE()`:
   if the current database is not the client's, or the email does not exist, it
   aborts.
2. For each exercise: looks it up by `name` with `deleted = 0`; reuses that `id`
   when found, otherwise mints a new UUID and inserts the `exercise` row.
3. Inserts `training_session`, its `session_exercise` rows and its `exercise_set`
   rows.
4. `COMMIT` plus a verification `SELECT` with the whole session.

Everything runs inside a transaction. UUIDs are minted when the file is written,
so re-running the same `.sql` collides with the `training_session` primary key
and rolls back instead of duplicating the session.
