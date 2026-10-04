import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { provideLocationMocks } from "@angular/common/testing";
import { TestBed } from "@angular/core/testing";
import { NavigationEnd, Router, provideRouter } from "@angular/router";
import { filter, firstValueFrom } from "rxjs";
import { BackNavigationService } from "./back-navigation.service";

@Component({ template: "" })
class BlankComponent {}

function nextNavigationEnd(router: Router): Promise<unknown> {
  return firstValueFrom(
    router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );
}

describe("BackNavigationService", () => {
  function setUp() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: "menus", component: BlankComponent },
          { path: "recipes", component: BlankComponent },
          { path: "recipes/:id", component: BlankComponent },
          { path: "recipes/:id/edit", component: BlankComponent },
        ]),
        provideLocationMocks(),
      ],
    });

    return {
      service: TestBed.inject(BackNavigationService),
      router: TestBed.inject(Router),
      location: TestBed.inject(Location),
    };
  }

  it("leave quita el formulario del historial y vuelve a donde se estaba", async () => {
    const { service, router, location } = setUp();
    router.initialNavigation();

    await router.navigateByUrl("/menus");
    await router.navigateByUrl("/recipes/abc");
    await router.navigateByUrl("/recipes/abc/edit");

    const backToDetail = nextNavigationEnd(router);
    service.leave(["/recipes", "abc"]);
    await backToDetail;

    expect(location.path()).toBe("/recipes/abc");

    const backToMenu = nextNavigationEnd(router);
    service.back(["/recipes"]);
    await backToMenu;

    expect(location.path()).toBe("/menus");
  });

  it("leave sin historial navega al fallback reemplazando la entrada", async () => {
    const { service, router } = setUp();
    const navigate = spyOn(router, "navigate").and.callThrough();

    await router.navigateByUrl("/recipes/abc/edit");

    service.leave(["/recipes", "abc"]);

    expect(navigate).toHaveBeenCalledWith(["/recipes", "abc"], {
      replaceUrl: true,
    });
  });
});
