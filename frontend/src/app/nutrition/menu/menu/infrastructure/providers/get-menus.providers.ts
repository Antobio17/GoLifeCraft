import { Provider } from "@angular/core";
import { GetMenusPort } from "@nutrition/menu/menu/domain/ports/get-menus.port";
import { HttpGetMenusAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-get-menus.adapter";
import { GetMenusService } from "@nutrition/menu/menu/application/services/get-menus.service";
import { MenuViewService } from "@nutrition/menu/menu/application/services/menu-view.service";

export class GetMenusProviders {
  static getProviders(): Provider[] {
    return [
      MenuViewService,
      { provide: GetMenusPort, useClass: HttpGetMenusAdapter },
      {
        provide: GetMenusService,
        useFactory: (port: GetMenusPort) => new GetMenusService(port),
        deps: [GetMenusPort],
      },
    ];
  }
}
