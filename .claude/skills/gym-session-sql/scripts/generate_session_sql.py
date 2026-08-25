#!/usr/bin/env python3
"""Generates the .sql that inserts a gym session (template) into a tenant database.

Usage:
    python3 generate_session_sql.py spec.json -o load-session.sql
    cat spec.json | python3 generate_session_sql.py - -o load-session.sql

spec.json describes the already interpreted session (see reference/spec.md).
The resulting SQL is self-contained: it resolves the user and their tenant by
email against the master database, reuses whatever exercises already exist by
name and creates the missing ones, all inside a single transaction.
"""

import argparse
import json
import sys
import uuid

EXERCISE_TYPES = ("unilateral", "bilateral")

ICONS = (
    "dumbbell", "barbell", "ezBar", "kettlebell", "weightPlate", "benchFlat",
    "benchIncline", "squatRack", "pullUpBar", "dipBars", "machine",
    "cablePulley", "cableRope", "latPulldown", "seatedRow", "legPress",
    "legMachine", "bicep", "chest", "back", "shoulder", "abs", "glute", "leg",
    "treadmill", "stationaryBike", "rowingMachine", "jumpRope", "stopwatch",
    "mat",
)

# Spanish literals on purpose: this is data the client reads in the app, and the
# muscle-picker filters against these exact strings.
MUSCLE_GROUPS = (
    "Pecho", "Espalda", "Hombro", "Bíceps", "Tríceps", "Antebrazo", "Trapecio",
    "Abdominales", "Core", "Lumbar",
    "Cuádriceps", "Femoral", "Glúteo", "Aductor", "Gemelo",
)


class SpecError(Exception):
    pass


def quote(value):
    if value is None:
        return "NULL"

    escaped = (
        str(value)
        .replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "")
    )

    return f"'{escaped}'"


def number(value):
    if value is None:
        return "NULL"

    as_float = float(value)

    if as_float == int(as_float):
        return str(int(as_float))

    return repr(as_float)


def new_id():
    return str(uuid.uuid4())


def validate_exercise(exercise, index):
    name = exercise.get("name")
    if not name or not (2 <= len(name) <= 255):
        raise SpecError(f"exercises[{index}].name must be between 2 and 255 characters")

    if exercise.get("type") not in EXERCISE_TYPES:
        raise SpecError(f"exercises[{index}].type must be one of {EXERCISE_TYPES}")

    muscle_groups = exercise.get("muscleGroups") or []
    if not muscle_groups:
        raise SpecError(f"exercises[{index}].muscleGroups cannot be empty")

    unknown = [group for group in muscle_groups if group not in MUSCLE_GROUPS]
    if unknown:
        raise SpecError(
            f"exercises[{index}].muscleGroups holds values outside the catalog: {unknown}"
        )

    icon = exercise.get("icon")
    if icon is not None and icon not in ICONS:
        raise SpecError(f"exercises[{index}].icon '{icon}' is not in the catalog")

    sets = exercise.get("sets") or []
    if not sets:
        raise SpecError(f"exercises[{index}].sets cannot be empty")

    for position, exercise_set in enumerate(sets, start=1):
        reps = exercise_set.get("reps")
        if not isinstance(reps, int) or reps <= 0:
            raise SpecError(
                f"exercises[{index}].sets[{position}].reps must be a positive integer"
            )

        weight = exercise_set.get("weight")
        if weight is not None and (not isinstance(weight, (int, float)) or weight < 0):
            raise SpecError(
                f"exercises[{index}].sets[{position}].weight must be a number >= 0 or null"
            )


def validate(spec):
    session = spec.get("session") or {}
    name = session.get("name")

    if not name or not (2 <= len(name) <= 255):
        raise SpecError("session.name must be between 2 and 255 characters")

    user = spec.get("user") or {}
    if not user.get("email"):
        raise SpecError("user.email is required: the user and their tenant both come from it")

    exercises = spec.get("exercises") or []
    if not exercises:
        raise SpecError("exercises cannot be empty")

    for index, exercise in enumerate(exercises):
        validate_exercise(exercise=exercise, index=index)


def estimate_duration(exercises):
    total_sets = sum(len(exercise["sets"]) for exercise in exercises)
    minutes = 8 + total_sets * 3

    return int(round(minutes / 5.0) * 5)


def build_user_resolution(spec):
    """Resolves @user_id by email and ties the file to the tenant database.

    The email is unique in master.user, so it yields the user and their tenant on
    its own. The `tenant_id = DATABASE()` condition doubles as the guard: run the
    file against another database and @user_id ends up NULL, so the INSERTs abort
    against the NOT NULL on created_by_user_id and the transaction rolls back.

    Comparisons always go against literals or DATABASE(), never against user
    variables: a variable carries the connection collation with the same
    coercibility as the column and blows up with "Illegal mix of collations"
    (error 1267) as soon as the tenant does not use the server default collation.
    """
    master = spec.get("masterDatabase", "master")
    email = quote((spec.get("user") or {})["email"])

    return [
        "-- The email is unique: it yields both the user and their tenant.",
        "-- A tenant database is named exactly like its tenant_id, so demanding",
        "-- tenant_id = DATABASE() makes it impossible to load the session into",
        "-- the wrong client.",
        f"SET @user_id = (SELECT `id` FROM `{master}`.`user` "
        f"WHERE `email` = {email} AND `tenant_id` = DATABASE() LIMIT 1);",
        f"SET @tenant_id = (SELECT `tenant_id` FROM `{master}`.`user` WHERE `email` = {email} LIMIT 1);",
        f"SET @user_name = (SELECT CONCAT_WS(' ', `name`, `lastname`) FROM `{master}`.`user` "
        f"WHERE `email` = {email} AND `tenant_id` = DATABASE() LIMIT 1);",
        "",
        "SELECT DATABASE() AS current_database,",
        "       IFNULL(@tenant_id, '*** this email is not in master.user ***') AS expected_database,",
        "       IFNULL(@user_id, '*** ABORTING: wrong database or unknown email ***') AS user,",
        "       @user_name AS name;",
    ]


def build_header(spec, session_id, duration):
    session = spec["session"]
    user = spec.get("user") or {}
    lines = [
        "-- ---------------------------------------------------------------------------",
        f"-- GoLifeCraft — gym session load: {session['name']}",
        "--",
        "-- Generated by .claude/skills/gym-session-sql.",
        f"-- Target user: {user['email']}",
        f"-- Session: {session['name']} ({duration} min, {len(spec['exercises'])} exercises)",
        f"-- Session id: {session_id}",
        "--",
        "-- ALWAYS run against the client's tenant database, never against master.",
        "-- Re-running this same file duplicates nothing: the training_session INSERT",
        "-- collides with its primary key and the whole transaction rolls back.",
        "-- ---------------------------------------------------------------------------",
        "",
        "SET NAMES utf8mb4;",
        "SET @now = UTC_TIMESTAMP();",
        "",
        "START TRANSACTION;",
        "",
    ]

    lines.extend(build_user_resolution(spec=spec))
    lines.append("")

    return lines


def build_exercise(exercise, index):
    var = f"@exercise_{index}"
    muscle_groups = json.dumps(exercise["muscleGroups"], ensure_ascii=False)
    lines = [
        f"-- {index}. {exercise['name']}",
        f"SET {var}_id = (SELECT `id` FROM `exercise` "
        f"WHERE `name` = {quote(exercise['name'])} AND `deleted` = 0 LIMIT 1);",
        f"SET {var}_is_new = {var}_id IS NULL;",
        f"SET {var}_id = COALESCE({var}_id, {quote(new_id())});",
        "INSERT INTO `exercise` (`id`, `version`, `name`, `description`, `type`,",
        "                        `muscle_groups`, `icon`, `deleted`, `created_at`,",
        "                        `updated_at`, `created_by_user_id`, `updated_by_user_id`)",
        f"SELECT {var}_id, 1, {quote(exercise['name'])}, {quote(exercise.get('description'))},",
        f"       {quote(exercise['type'])}, {quote(muscle_groups)}, {quote(exercise.get('icon'))}, 0,",
        "       @now, @now, @user_id, @user_id",
        f"FROM DUAL WHERE {var}_is_new;",
        "",
    ]

    return lines


def build_session_exercise(exercise, index, session_exercise_id):
    var = f"@exercise_{index}"
    lines = [
        f"SET @session_exercise_{index}_id = {quote(session_exercise_id)};",
        "INSERT INTO `session_exercise` (`id`, `version`, `session_id`, `exercise_id`,",
        "                                `position`, `note`, `created_at`, `updated_at`,",
        "                                `created_by_user_id`, `updated_by_user_id`)",
        f"VALUES (@session_exercise_{index}_id, 1, @session_id, {var}_id,",
        f"        {index}, {quote(exercise.get('note'))}, @now, @now, @user_id, @user_id);",
        "",
        "INSERT INTO `exercise_set` (`id`, `version`, `session_exercise_id`, `position`,",
        "                            `reps`, `weight`, `created_at`, `updated_at`,",
        "                            `created_by_user_id`, `updated_by_user_id`)",
        "VALUES",
    ]

    values = []
    for position, exercise_set in enumerate(exercise["sets"], start=1):
        values.append(
            f"    ({quote(new_id())}, 1, @session_exercise_{index}_id, {position}, "
            f"{exercise_set['reps']}, {number(exercise_set.get('weight'))}, @now, @now, @user_id, @user_id)"
        )

    lines.append(",\n".join(values) + ";")
    lines.append("")

    return lines


def build_footer(session_id):
    return [
        "COMMIT;",
        "",
        "-- Verification: this must list the session with every exercise and set.",
        "SELECT s.`name` AS session,",
        "       se.`position` AS pos,",
        "       e.`name` AS exercise,",
        "       es.`position` AS set_number,",
        "       es.`reps`,",
        "       es.`weight`",
        "FROM `training_session` s",
        "JOIN `session_exercise` se ON se.`session_id` = s.`id`",
        "JOIN `exercise` e ON e.`id` = se.`exercise_id`",
        "JOIN `exercise_set` es ON es.`session_exercise_id` = se.`id`",
        f"WHERE s.`id` = {quote(session_id)}",
        "ORDER BY se.`position`, es.`position`;",
    ]


def build_sql(spec):
    validate(spec=spec)

    exercises = spec["exercises"]
    session = spec["session"]
    session_id = session.get("id") or new_id()
    duration = session.get("estimatedDurationMinutes") or estimate_duration(exercises=exercises)

    lines = build_header(spec=spec, session_id=session_id, duration=duration)

    for index, exercise in enumerate(exercises, start=1):
        lines.extend(build_exercise(exercise=exercise, index=index))

    lines.extend([
        "-- Session",
        f"SET @session_id = {quote(session_id)};",
        "INSERT INTO `training_session` (`id`, `version`, `name`, `estimated_duration_minutes`,",
        "                                `created_at`, `updated_at`, `created_by_user_id`,",
        "                                `updated_by_user_id`)",
        f"VALUES (@session_id, 1, {quote(session['name'])}, {duration}, @now, @now, @user_id, @user_id);",
        "",
    ])

    for index, exercise in enumerate(exercises, start=1):
        lines.extend(
            build_session_exercise(
                exercise=exercise,
                index=index,
                session_exercise_id=new_id(),
            )
        )

    lines.extend(build_footer(session_id=session_id))

    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generates the SQL that loads a gym session")
    parser.add_argument("spec", help="Path to the JSON spec, or '-' to read stdin")
    parser.add_argument("-o", "--output", help="Output .sql file (defaults to stdout)")
    args = parser.parse_args()

    raw = sys.stdin.read() if args.spec == "-" else open(args.spec, encoding="utf-8").read()

    try:
        sql = build_sql(spec=json.loads(raw))
    except SpecError as error:
        print(f"Invalid spec: {error}", file=sys.stderr)
        return 1

    if not args.output:
        print(sql, end="")
        return 0

    with open(args.output, "w", encoding="utf-8") as handle:
        handle.write(sql)

    print(f"SQL written to {args.output}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
