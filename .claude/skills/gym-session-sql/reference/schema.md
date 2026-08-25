# Gym module schema and catalogs

Every table lives in the **tenant database**. `master` is only read to resolve
the user.

## Tables involved

### `exercise` - the client's exercise library

| Column | Type | Notes |
|---|---|---|
| `id` | varchar(36) PK | UUID v4 |
| `version` | int | optimistic locking; inserted as `1` |
| `name` | varchar(255) | unique by domain rule (no DB constraint) |
| `description` | text NULL | |
| `type` | varchar(20) | `unilateral` \| `bilateral` |
| `muscle_groups` | json | array of strings, >= 1 |
| `icon` | varchar(40) NULL | key from the icon catalog |
| `deleted` | tinyint | soft delete; `0` |
| `created_at` / `updated_at` | datetime | UTC |
| `created_by_user_id` / `updated_by_user_id` | varchar(36) | user from `master.user` |

### `training_session` - the session (template)

`id`, `version`, `name`, `estimated_duration_minutes` (int, >= 0), timestamps and
users.

### `session_exercise` - an exercise inside the session

`id`, `version`, `session_id`, `exercise_id`, `position` (**starts at 1**),
`note` (text NULL), timestamps and users.

### `exercise_set` - a set inside the exercise

`id`, `version`, `session_exercise_id`, `position` (**starts at 1**),
`reps` (int), `weight` (double NULL), timestamps and users.

> There are no foreign keys: the Gym module stores plain scalar ids. Integrity is
> on whoever writes.

## Muscle group catalog

These are the **Spanish literals** the frontend `muscle-picker` uses. They are
data the client reads, so they stay in Spanish; any other value breaks the
filter-by-muscle screens:

- **Upper body**: `Pecho`, `Espalda`, `Hombro`, `Bíceps`, `Tríceps`,
  `Antebrazo`, `Trapecio`
- **Core**: `Abdominales`, `Core`, `Lumbar`
- **Lower body**: `Cuádriceps`, `Femoral`, `Glúteo`, `Aductor`, `Gemelo`

Put the prime mover first and add the obvious synergists (incline press ->
`Pecho`, `Hombro`, `Tríceps`; a curl -> just `Bíceps`).

## Icon catalog

`dumbbell`, `barbell`, `ezBar`, `kettlebell`, `weightPlate`, `benchFlat`,
`benchIncline`, `squatRack`, `pullUpBar`, `dipBars`, `machine`, `cablePulley`,
`cableRope`, `latPulldown`, `seatedRow`, `legPress`, `legMachine`, `bicep`,
`chest`, `back`, `shoulder`, `abs`, `glute`, `leg`, `treadmill`,
`stationaryBike`, `rowingMachine`, `jumpRope`, `stopwatch`, `mat`.

Rule of thumb: equipment wins over muscle.

| Exercise | Icon |
|---|---|
| Incline barbell bench press | `benchIncline` |
| Flat bench press | `benchFlat` |
| Anything with a free barbell | `barbell` |
| Dumbbells | `dumbbell` |
| Generic machine (chest press, pec deck) | `machine` / `chest` |
| Cable with a handle or bar | `cablePulley` |
| Cable with a rope (triceps) | `cableRope` |
| Lat pulldown | `latPulldown` |
| Seated row | `seatedRow` |
| Leg press | `legPress` |
| Machine leg curl / extension | `legMachine` |
| Squat | `squatRack` |
| Hip thrust | `glute` |
| Biceps curl | `bicep` |
| Lateral raises | `shoulder` |

## `unilateral` vs `bilateral`

- `bilateral`: both sides at once (barbell, chest press machine, two-handed cable
  work, an overhead triceps extension holding one dumbbell with both hands).
- `unilateral`: one side at a time (alternating hammer curls, single-arm rows,
  lunges, single-arm cable lateral raises).

When in doubt, `bilateral`.
