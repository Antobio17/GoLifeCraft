import { TestBed } from "@angular/core/testing";
import { ExerciseSetView } from "../../domain/models/session-detail.model";
import { SetKind } from "../../domain/models/set-kind.model";
import { ExerciseSetSummaryService } from "./exercise-set-summary.service";

describe("ExerciseSetSummaryService", () => {
  let service: ExerciseSetSummaryService;

  const set = (
    reps: number,
    weight: number | null,
    kind = SetKind.Effective,
  ): ExerciseSetView => ({
    id: `${reps}-${weight}`,
    position: 1,
    reps,
    weight,
    kind,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseSetSummaryService);
  });

  it("ignores warmups and reads a fixed scheme", () => {
    const summary = service.summarize([
      set(10, 40, SetKind.Warmup),
      set(8, 70),
      set(8, 70),
      set(8, 72.5),
    ]);

    expect(service.schemeLabel(summary)).toBe("3 × 8");
    expect(summary.topWeightKg).toBe(72.5);
  });

  it("shows a rep range when the sets differ", () => {
    const summary = service.summarize([set(12, 15), set(10, 17.5)]);

    expect(service.schemeLabel(summary)).toBe("2 × 10-12");
  });

  it("falls back to every set when there are only warmups", () => {
    const summary = service.summarize([set(10, null, SetKind.Warmup)]);

    expect(service.schemeLabel(summary)).toBe("1 × 10");
    expect(summary.topWeightKg).toBe(0);
  });

  it("returns a dash for an exercise without sets", () => {
    expect(service.schemeLabel(service.summarize([]))).toBe("—");
  });
});
