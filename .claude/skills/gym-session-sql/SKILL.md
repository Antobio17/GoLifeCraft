---
name: gym-session-sql
description: Turns a client's message describing a gym routine, session or workout (exercises, sets, reps and weights) into a .sql file that inserts it into their tenant database, and hands over the command to run it against the production MySQL. The message can be written any way at all - a list, a paragraph, a table, a transcribed voice note or a screenshot. Use it as soon as a gym routine shows up to be loaded, even if nobody asks in those words.
---

# Load a client's session into their database

A client sends their routine however they happen to write it. The goal is to
leave the **session (training template)** created in their tenant database, with
its exercises and sets, reusing whatever exercises their library already has.

The API is not involved: a `.sql` file is generated and run against the
`golifecraft_mysql` container.

## Flow

1. **Interpret the message** -> an ordered list of exercises with their sets
   (see *Interpreting the message*).
2. **Look for the client's email in the message itself**; ask for it if it is not
   there. It is the only thing needed: it is unique in `master.user`, so both the
   user and their tenant come from it (see *Resolving the user*). Never ask for
   ids or tenants by hand.
3. **Write the JSON spec** in the scratchpad (format in `reference/spec.md`).
4. **Generate the SQL**:
   ```bash
   python3 .claude/skills/gym-session-sql/scripts/generate_session_sql.py \
       <spec.json> -o docs/sql/gym/<date>-<client>-<session>.sql
   ```
   The script validates types, muscle groups and icons against the real catalogs;
   when something does not fit it fails, and the fix goes in the spec, never in
   the generated SQL by hand. `docs/sql/` is gitignored on purpose: these files
   carry client data and are one-offs, they do not belong in the repo.
5. **Show the generated SQL and the command to run it** (see *Running it*).
   Do not run it yourself: that is a production database and the user launches it.

## Interpreting the message

Every client writes however they like: a list, a running paragraph, a table, a
transcribed voice note, a photo of their notebook. **There is no canonical format
and nothing to parse**: read the message and pull out what is needed.

What you must end up with:

- **The session name.** Usually a heading on top (`Día 2`, `torso empuje`,
  `ESPALDA-BÍCEPS`). Normalize it into something readable, without shouting in
  caps. With no heading, derive one from the muscles being trained.
- **The exercises, in the order they appear** (`position` starts at 1).
- **The sets of each exercise**, each one with its reps and its weight.

### Ambiguities worth getting right

- **`8x60kg`** is `reps x weight`, but **`4x10`** is almost always
  `sets x reps`. Context tells them apart: when a line lists several groups
  separated by dashes or commas, each group is **one set**; when there is a
  single group and the first number is small (2-6), it is usually the set count.
- **Spanish decimal comma**: `27,5kg` -> `27.5`.
- **Rep ranges** (`4x8-10`) and **RIR/RPE**: they do not fit the model. Take the
  low end of the range and put the nuance in the exercise `note`.
- **No weight** (`al fallo`, bodyweight, `12 reps`) -> `weight: null`.
- **`10/10` or "per side"** -> usually a `unilateral` exercise; the reps are the
  ones for a single side.
- **Pounds** (`lb`, `lbs`) -> convert to kilos (`x 0.4536`) and say so.
- **Rests, tempos, supersets, coach notes** -> the exercise `note`; there is no
  dedicated field for any of that.
- **Names come abbreviated** (`Inclinado barra`, `Tríceps overhead manc`): expand
  them into a full, readable Spanish name, since the library is in Spanish. That
  name is the reuse key: an exercise that already exists in the tenant's library
  gets linked, otherwise it is created. One made-up name pollutes the library.
- Each exercise also needs `type`, `muscleGroups` and `icon`, derived from the
  name. Catalogs and criteria in `reference/schema.md`.

### Before generating

When the message is ambiguous (an exercise that makes no sense, an impossible
weight, no way to tell sets from reps), **show your reading as a table and ask**.
Never invent exercises or sets the client did not write, and never complete a
routine that "looks unfinished".

## Resolving the user

The email is **unique** in `master.user`, so it is enough on its own:

- `created_by_user_id` comes from `SELECT id FROM master.user WHERE email = ...`.
- The **tenant** comes from that same row. Since the client's database is named
  exactly like their `tenant_id`, the SQL demands `tenant_id = DATABASE()` in
  that very query: run the file against another client and `@user_id` ends up
  NULL, so everything aborts without writing a thing.
- An email that does not exist aborts just the same.

The check the script prints on start says which database you are on and which one
you should be on, so a failure reads straight off:

```
current_database   expected_database   user                     name
OTROTENANT         GLC0000000007       *** ABORTING: ... ***    NULL
```

## Running it

Three commands on the production server, from the project directory (the one
holding `.env.local`). The client's database **is** their `tenant_id`, and it
comes from the same email:

```bash
DB_PASS=$(grep -m1 '^DATABASE_MASTER_PASSWORD=' .env.local | cut -d= -f2- | tr -d "\"'")
```

```bash
TENANT=$(docker exec golifecraft_mysql mysql -uroot -p"$DB_PASS" -N -B \
  -e "SELECT tenant_id FROM master.user WHERE email = 'CLIENT@EMAIL'")
```

```bash
docker exec -i golifecraft_mysql mysql --default-character-set=utf8mb4 \
  -uroot -p"$DB_PASS" "$TENANT" < load-session.sql
```

The `-i` is mandatory: without it `docker exec` never attaches stdin and `mysql`
simply reads nothing, silently.

When the file lives locally and not on the server, run it in one go:

```bash
ssh USER@SERVER "cd PROJECT_PATH && \
  DB_PASS=\$(grep -m1 '^DATABASE_MASTER_PASSWORD=' .env.local | cut -d= -f2- | tr -d '\"') && \
  TENANT=\$(docker exec golifecraft_mysql mysql -uroot -p\"\$DB_PASS\" -N -B \
    -e \"SELECT tenant_id FROM master.user WHERE email = 'CLIENT@EMAIL'\") && \
  docker exec -i golifecraft_mysql mysql --default-character-set=utf8mb4 \
    -uroot -p\"\$DB_PASS\" \"\$TENANT\"" < docs/sql/gym/<file>.sql
```

The script runs inside a transaction and `mysql` aborts on the first error when
reading from a file, so any failure (wrong database, unknown email, session
already loaded) leaves the database untouched.

It prints two things: the check up front (current vs expected database, resolved
user and their name) and the full session at the end. Go over both with the user.

## What it does NOT do

- **It emits no domain events.** Inserting through SQL bypasses the bus, so there
  are no rows in the event log and no subscribers fire. Irrelevant for loading a
  template; the day the trace matters, go through the API or MCP (`write_model`).
- **It creates no workout history** (`workout`). It creates the template the
  client sees under *Sesiones* and can start from the app. If what they want is
  logging a workout they already did, that is a different model: ask first.
- **It never deletes or updates**. If the session already exists and has to
  change, edit it from the app or write a deliberate SQL for it.
