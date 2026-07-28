import { Provider } from "@angular/core";
import { CreateMenuPort } from "@nutrition/menu/menu/domain/ports/create-menu.port";
import { UpdateMenuPort } from "@nutrition/menu/menu/domain/ports/update-menu.port";
import { DeleteMenuPort } from "@nutrition/menu/menu/domain/ports/delete-menu.port";
import { DuplicateMenuPort } from "@nutrition/menu/menu/domain/ports/duplicate-menu.port";
import { LoadMenuPort } from "@nutrition/menu/menu/domain/ports/load-menu.port";
import { ApplyWeekMenuPort } from "@nutrition/menu/menu/domain/ports/apply-week-menu.port";
import { HttpCreateMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-create-menu.adapter";
import { HttpUpdateMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-update-menu.adapter";
import { HttpDeleteMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-delete-menu.adapter";
import { HttpDuplicateMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-duplicate-menu.adapter";
import { HttpLoadMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-load-menu.adapter";
import { HttpApplyWeekMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-apply-week-menu.adapter";
import { CreateMenuService } from "@nutrition/menu/menu/application/services/create-menu.service";
import { UpdateMenuService } from "@nutrition/menu/menu/application/services/update-menu.service";
import { DeleteMenuService } from "@nutrition/menu/menu/application/services/delete-menu.service";
import { DuplicateMenuService } from "@nutrition/menu/menu/application/services/duplicate-menu.service";
import { LoadMenuService } from "@nutrition/menu/menu/application/services/load-menu.service";
import { ApplyWeekMenuService } from "@nutrition/menu/menu/application/services/apply-week-menu.service";
import { MenuEditorService } from "@nutrition/menu/menu/application/services/menu-editor.service";
import { MenuDraftService } from "@nutrition/menu/menu/application/services/menu-draft.service";

export class MenuWriteProviders {
  static getProviders(): Provider[] {
    return [
      MenuEditorService,
      MenuDraftService,
      { provide: CreateMenuPort, useClass: HttpCreateMenuAdapter },
      {
        provide: CreateMenuService,
        useFactory: (port: CreateMenuPort) => new CreateMenuService(port),
        deps: [CreateMenuPort],
      },
      { provide: UpdateMenuPort, useClass: HttpUpdateMenuAdapter },
      {
        provide: UpdateMenuService,
        useFactory: (port: UpdateMenuPort) => new UpdateMenuService(port),
        deps: [UpdateMenuPort],
      },
      { provide: DeleteMenuPort, useClass: HttpDeleteMenuAdapter },
      {
        provide: DeleteMenuService,
        useFactory: (port: DeleteMenuPort) => new DeleteMenuService(port),
        deps: [DeleteMenuPort],
      },
      { provide: DuplicateMenuPort, useClass: HttpDuplicateMenuAdapter },
      {
        provide: DuplicateMenuService,
        useFactory: (port: DuplicateMenuPort) => new DuplicateMenuService(port),
        deps: [DuplicateMenuPort],
      },
      { provide: LoadMenuPort, useClass: HttpLoadMenuAdapter },
      {
        provide: LoadMenuService,
        useFactory: (port: LoadMenuPort) => new LoadMenuService(port),
        deps: [LoadMenuPort],
      },
      { provide: ApplyWeekMenuPort, useClass: HttpApplyWeekMenuAdapter },
      {
        provide: ApplyWeekMenuService,
        useFactory: (port: ApplyWeekMenuPort) => new ApplyWeekMenuService(port),
        deps: [ApplyWeekMenuPort],
      },
    ];
  }
}
