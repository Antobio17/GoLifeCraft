import { TestBed } from "@angular/core/testing";
import { ExerciseSetView } from "../../domain/models/session-detail.model";
import { SetKind } from "../../domain/models/set-kind.model";
import { SetNumberingService } from "./set-numbering.service";

describe("SetNumberingService", () => {
  let service: SetNumberingService;

  const set = (id: string, kind: SetKind): ExerciseSetView => ({
    id,
    position: 1,
    reps: 10,
    weight: 100,
    kind,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetNumberingService);
  });

  it("numbers warmup and effective sets in separate sequences", () => {
    const rows = service.rows([
      set("s1", SetKind.Warmup),
      set("s2", SetKind.Warmup),
      set("s3", SetKind.Effective),
      set("s4", SetKind.Effective),
    ]);

    expect(rows.map((row) => row.displayLabel)).toEqual(["A1", "A2", "1", "2"]);
    expect(rows.map((row) => row.warmup)).toEqual([true, true, false, false]);
  });

  it("keeps numbering the effective sets from one when a warmup sits between them", () => {
    const rows = service.rows([
      set("s1", SetKind.Effective),
      set("s2", SetKind.Warmup),
      set("s3", SetKind.Effective),
    ]);

    expect(rows.map((row) => row.displayLabel)).toEqual(["1", "A1", "2"]);
  });

  it("preserves the properties of the set it numbers", () => {
    const [row] = service.rows([
      { ...set("s1", SetKind.Warmup), reps: 4, weight: 85 },
    ]);

    expect(row.id).toBe("s1");
    expect(row.reps).toBe(4);
    expect(row.weight).toBe(85);
  });
});
