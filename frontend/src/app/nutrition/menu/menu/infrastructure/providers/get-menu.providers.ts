import { Provider } from "@angular/core";
import { GetMenuPort } from "@nutrition/menu/menu/domain/ports/get-menu.port";
import { GetMenuShoppingNeedsPort } from "@nutrition/menu/menu/domain/ports/get-menu-shopping-needs.port";
import { HttpGetMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-get-menu.adapter";
import { HttpGetMenuShoppingNeedsAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-get-menu-shopping-needs.adapter";
import { GetMenuService } from "@nutrition/menu/menu/application/services/get-menu.service";
import { GetMenuShoppingNeedsService } from "@nutrition/menu/menu/application/services/get-menu-shopping-needs.service";

export class GetMenuProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetMenuPort, useClass: HttpGetMenuAdapter },
      {
        provide: GetMenuService,
        useFactory: (port: GetMenuPort) => new GetMenuService(port),
        deps: [GetMenuPort],
      },
      {
        provide: GetMenuShoppingNeedsPort,
        useClass: HttpGetMenuShoppingNeedsAdapter,
      },
      {
        provide: GetMenuShoppingNeedsService,
        useFactory: (port: GetMenuShoppingNeedsPort) =>
          new GetMenuShoppingNeedsService(port),
        deps: [GetMenuShoppingNeedsPort],
      },
    ];
  }
}
