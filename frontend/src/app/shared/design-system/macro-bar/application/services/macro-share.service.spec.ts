import { TestBed } from "@angular/core/testing";
import { MacroShareService } from "./macro-share.service";

describe("MacroShareService", () => {
  let service: MacroShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MacroShareService);
  });

  it("splits by calories, weighting fat at 9 kcal per gram", () => {
    const share = service.byCalories(10, 10, 10);

    expect(share.protein).toBeCloseTo(23.53, 2);
    expect(share.fat).toBeCloseTo(52.94, 2);
    expect(share.carbs).toBeCloseTo(23.53, 2);
  });

  it("adds up to one hundred", () => {
    const share = service.byCalories(31.4, 7.2, 55.9);

    expect(share.protein + share.fat + share.carbs).toBeCloseTo(100, 6);
  });

  it("gives a single macro the whole bar", () => {
    expect(service.byCalories(0, 12, 0)).toEqual({
      protein: 0,
      fat: 100,
      carbs: 0,
    });
  });

  it("returns an empty split when every macro is zero", () => {
    expect(service.byCalories(0, 0, 0)).toEqual({
      protein: 0,
      fat: 0,
      carbs: 0,
    });
  });

  it("ignores negative and non finite grams", () => {
    expect(service.byCalories(-5, Number.NaN, 8)).toEqual({
      protein: 0,
      fat: 0,
      carbs: 100,
    });
  });
});
