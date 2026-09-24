import { TestBed } from "@angular/core/testing";
import { BottomNavMinimizeService } from "./bottom-nav-minimize.service";
import { BottomNavScrollState } from "../../domain/models/bottom-nav-scroll-state.model";

describe("BottomNavMinimizeService", () => {
  let service: BottomNavMinimizeService;

  const scrollThrough = (
    ys: number[],
    maxY = 2000,
    from?: BottomNavScrollState,
  ): BottomNavScrollState =>
    ys.reduce(
      (state, y) => service.next(state, { y, maxY }),
      from ?? service.initial(),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomNavMinimizeService);
  });

  it("starts expanded", () => {
    expect(service.initial().minimized).toBeFalse();
  });

  it("minimizes after scrolling down past the threshold", () => {
    expect(scrollThrough([100, 110, 140]).minimized).toBeTrue();
  });

  it("ignores small jitters while scrolling down", () => {
    const expanded = scrollThrough([100, 200, 400, 300]);

    expect(scrollThrough([310], 2000, expanded).minimized).toBeFalse();
  });

  it("expands again after scrolling up past the threshold", () => {
    const minimized = scrollThrough([100, 200, 400]);

    expect(scrollThrough([390, 360], 2000, minimized).minimized).toBeFalse();
  });

  it("stays minimized on a short scroll up", () => {
    const minimized = scrollThrough([100, 200, 400]);

    expect(scrollThrough([390], 2000, minimized).minimized).toBeTrue();
  });

  it("always expands near the top of the page", () => {
    const minimized = scrollThrough([100, 200, 400]);

    expect(scrollThrough([40], 2000, minimized).minimized).toBeFalse();
  });

  it("does not expand on the rubber band past the end of the page", () => {
    const minimized = scrollThrough([800, 1000, 1200], 1200);

    expect(
      scrollThrough([1260, 1230, 1200], 1200, minimized).minimized,
    ).toBeTrue();
  });

  it("expands on request and forgets the travelled distance", () => {
    const expanded = service.expand(scrollThrough([100, 200, 400]));

    expect(expanded.minimized).toBeFalse();
    expect(expanded.travel).toBe(0);
  });
});
