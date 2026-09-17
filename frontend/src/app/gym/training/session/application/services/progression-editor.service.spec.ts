import { TestBed } from "@angular/core/testing";
import { ExerciseSetView } from "../../domain/models/session-detail.model";
import { Progression } from "../../domain/models/progression.model";
import { ProgressionMode } from "../../domain/models/progression-mode.model";
import { SetKind } from "../../domain/models/set-kind.model";
import { ProgressionEditorService } from "./progression-editor.service";

describe("ProgressionEditorService", () => {
  let service: ProgressionEditorService;

  const set = (id: string, kind: SetKind, reps: number): ExerciseSetView => ({
    id,
    position: 1,
    reps,
    weight: 100,
    kind,
  });

  const none: Progression = {
    mode: ProgressionMode.None,
    repTargets: [],
    repTolerance: 2,
    incrementKg: null,
  };

  const ramp = [
    set("w1", SetKind.Warmup, 12),
    set("w2", SetKind.Warmup, 4),
    set("e1", SetKind.Effective, 12),
    set("e2", SetKind.Effective, 11),
    set("e3", SetKind.Effective, 10),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressionEditorService);
  });

  it("builds one target per effective set, ignoring the warmup ramp", () => {
    const rows = service.targetRows(ramp, none);

    expect(rows.length).toBe(3);
    expect(rows.map((row) => row.label)).toEqual(["1", "2", "3"]);
  });

  it("seeds a missing target from the reps the set already has", () => {
    const rows = service.targetRows(ramp, none);

    expect(rows.map((row) => row.reps)).toEqual([12, 11, 10]);
  });

  it("drops the stored targets that no longer have an effective set", () => {
    const stored: Progression = {
      ...none,
      mode: ProgressionMode.Cascade,
      repTargets: [12, 11, 10, 9],
    };

    const rows = service.targetRows([ramp[2], ramp[3]], stored);

    expect(rows.map((row) => row.reps)).toEqual([12, 11]);
  });

  it("fills targets and a default increment when progression is switched on", () => {
    const progression = service.withMode(ramp, none, ProgressionMode.Cascade);

    expect(progression.repTargets).toEqual([12, 11, 10]);
    expect(progression.incrementKg).toBe(2.5);
  });

  it("keeps the increment already chosen when switching mode", () => {
    const configured: Progression = { ...none, incrementKg: 5 };

    const progression = service.withMode(
      ramp,
      configured,
      ProgressionMode.Block,
    );

    expect(progression.incrementKg).toBe(5);
  });

  it("changes only the target it is given", () => {
    const configured = service.withMode(ramp, none, ProgressionMode.Cascade);

    const progression = service.withTarget(ramp, configured, 1, 12);

    expect(progression.repTargets).toEqual([12, 12, 10]);
  });
});
