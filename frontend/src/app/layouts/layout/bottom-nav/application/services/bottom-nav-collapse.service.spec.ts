import { BottomNavCollapseService } from "./bottom-nav-collapse.service";

describe("BottomNavCollapseService", () => {
  const MAX = 4000;
  let service: BottomNavCollapseService;

  const scrollThrough = (...positions: number[]) =>
    positions.forEach((y) => service.track(y, MAX));

  beforeEach(() => {
    service = new BottomNavCollapseService();
  });

  it("starts expanded", () => {
    expect(service.collapsed()).toBeFalse();
  });

  it("collapses after scrolling down past the threshold", () => {
    scrollThrough(60, 80, 100);

    expect(service.collapsed()).toBeTrue();
  });

  it("ignores a small scroll down", () => {
    scrollThrough(60, 80);

    expect(service.collapsed()).toBeFalse();
  });

  it("expands after a short scroll up", () => {
    scrollThrough(100, 400, 390, 380);

    expect(service.collapsed()).toBeFalse();
  });

  it("keeps collapsed while the scroll up is a jitter", () => {
    scrollThrough(100, 400, 390);

    expect(service.collapsed()).toBeTrue();
  });

  it("measures the scroll up from the deepest point reached", () => {
    scrollThrough(100, 400, 800, 790);

    expect(service.collapsed()).toBeTrue();
  });

  it("stays expanded near the top", () => {
    scrollThrough(0, 60);

    expect(service.collapsed()).toBeFalse();
  });

  it("expands when reaching the end of the page", () => {
    scrollThrough(100, 400, MAX - 10);

    expect(service.collapsed()).toBeFalse();
  });

  it("expands on demand", () => {
    scrollThrough(100, 400);

    service.expand();

    expect(service.collapsed()).toBeFalse();
  });
});
