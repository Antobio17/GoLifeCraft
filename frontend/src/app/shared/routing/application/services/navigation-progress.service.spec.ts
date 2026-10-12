import { Component } from "@angular/core";
import { provideLocationMocks } from "@angular/common/testing";
import { TestBed } from "@angular/core/testing";
import { NavigationStart, Router, provideRouter } from "@angular/router";
import { filter, firstValueFrom } from "rxjs";
import { NavigationProgressService } from "./navigation-progress.service";

@Component({ template: "" })
class BlankComponent {}

describe("NavigationProgressService", () => {
  function setUp(guard: () => boolean | Promise<boolean> = () => true) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: "diary", component: BlankComponent },
          { path: "kitchen", component: BlankComponent, canActivate: [guard] },
        ]),
        provideLocationMocks(),
      ],
    });

    return {
      service: TestBed.inject(NavigationProgressService),
      router: TestBed.inject(Router),
    };
  }

  it("apunta al destino desde que empieza la navegación y lo suelta al terminar", async () => {
    let release: (allowed: boolean) => void = () => undefined;
    const decision = new Promise<boolean>((resolve) => (release = resolve));
    const { service, router } = setUp(() => decision);
    await router.navigateByUrl("/diary");

    const started = firstValueFrom(
      router.events.pipe(filter((event) => event instanceof NavigationStart)),
    );
    const navigation = router.navigateByUrl("/kitchen");
    await started;

    expect(service.navigating()).toBeTrue();
    expect(service.targetUrl()).toBe("/kitchen");

    release(true);
    await navigation;

    expect(service.navigating()).toBeFalse();
    expect(service.targetUrl()).toBe("/kitchen");
  });

  it("vuelve a la URL actual si la navegación se cancela", async () => {
    const { service, router } = setUp(() => false);
    await router.navigateByUrl("/diary");

    await router.navigateByUrl("/kitchen");

    expect(service.navigating()).toBeFalse();
    expect(service.targetUrl()).toBe("/diary");
  });
});
