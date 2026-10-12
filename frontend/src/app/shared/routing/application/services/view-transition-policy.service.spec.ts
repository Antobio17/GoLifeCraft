import { Component } from "@angular/core";
import { provideLocationMocks } from "@angular/common/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router, provideRouter } from "@angular/router";
import { ViewTransitionPolicyService } from "./view-transition-policy.service";

@Component({ template: "" })
class BlankComponent {}

describe("ViewTransitionPolicyService", () => {
  function setUp() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: "",
            children: [
              { path: "diary", component: BlankComponent },
              { path: "kitchen", component: BlankComponent },
              { path: "kitchen/:id", component: BlankComponent },
            ],
          },
        ]),
        provideLocationMocks(),
      ],
    });

    return {
      service: TestBed.inject(ViewTransitionPolicyService),
      router: TestBed.inject(Router),
    };
  }

  async function snapshotOf(
    router: Router,
    url: string,
  ): Promise<ActivatedRouteSnapshot> {
    await router.navigateByUrl(url);

    return router.routerState.snapshot.root;
  }

  it("considera que cambiar de sección cruza secciones", async () => {
    const { service, router } = setUp();

    const diary = await snapshotOf(router, "/diary");
    const kitchen = await snapshotOf(router, "/kitchen");

    expect(service.crossesSection(diary, kitchen)).toBeTrue();
  });

  it("entrar al detalle dentro de la misma sección no cruza secciones", async () => {
    const { service, router } = setUp();

    const list = await snapshotOf(router, "/kitchen");
    const detail = await snapshotOf(router, "/kitchen/abc");

    expect(service.crossesSection(list, detail)).toBeFalse();
    expect(service.crossesSection(detail, list)).toBeFalse();
  });
});
