import { Provider } from "@angular/core";
import { CreateMenuPort } from "@nutrition/menu/menu/domain/ports/create-menu.port";
import { DeleteMenuPort } from "@nutrition/menu/menu/domain/ports/delete-menu.port";
import { DuplicateMenuPort } from "@nutrition/menu/menu/domain/ports/duplicate-menu.port";
import { LoadMenuPort } from "@nutrition/menu/menu/domain/ports/load-menu.port";
import { ApplyWeekMenuPort } from "@nutrition/menu/menu/domain/ports/apply-week-menu.port";
import { UpdateMenuItemNodePort } from "@nutrition/menu/menu/domain/ports/update-menu-item-node.port";
import { ResetMenuItemTreePort } from "@nutrition/menu/menu/domain/ports/reset-menu-item-tree.port";
import { HttpCreateMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-create-menu.adapter";
import { HttpDeleteMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-delete-menu.adapter";
import { HttpDuplicateMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-duplicate-menu.adapter";
import { HttpLoadMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-load-menu.adapter";
import { HttpApplyWeekMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-apply-week-menu.adapter";
import { HttpUpdateMenuItemNodeAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-update-menu-item-node.adapter";
import { HttpResetMenuItemTreeAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-reset-menu-item-tree.adapter";
import { CreateMenuService } from "@nutrition/menu/menu/application/services/create-menu.service";
import { DeleteMenuService } from "@nutrition/menu/menu/application/services/delete-menu.service";
import { DuplicateMenuService } from "@nutrition/menu/menu/application/services/duplicate-menu.service";
import { LoadMenuService } from "@nutrition/menu/menu/application/services/load-menu.service";
import { ApplyWeekMenuService } from "@nutrition/menu/menu/application/services/apply-week-menu.service";
import { MenuEditorService } from "@nutrition/menu/menu/application/services/menu-editor.service";
import { MenuDraftService } from "@nutrition/menu/menu/application/services/menu-draft.service";
import { MenuTreeViewService } from "@nutrition/menu/menu/application/services/menu-tree-view.service";
import { UpdateMenuItemNodeService } from "@nutrition/menu/menu/application/services/update-menu-item-node.service";
import { ResetMenuItemTreeService } from "@nutrition/menu/menu/application/services/reset-menu-item-tree.service";
import { UpdateMenuDetailsPort } from "@nutrition/menu/menu/domain/ports/update-menu-details.port";
import { SaveMenuItemPort } from "@nutrition/menu/menu/domain/ports/save-menu-item.port";
import { HttpUpdateMenuDetailsAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-update-menu-details.adapter";
import { HttpSaveMenuItemAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-save-menu-item.adapter";
import { UpdateMenuDetailsService } from "@nutrition/menu/menu/application/services/update-menu-details.service";
import { SaveMenuItemService } from "@nutrition/menu/menu/application/services/save-menu-item.service";

export class MenuWriteProviders {
  static getProviders(): Provider[] {
    return [
      MenuEditorService,
      MenuDraftService,
      MenuTreeViewService,
      { provide: CreateMenuPort, useClass: HttpCreateMenuAdapter },
      {
        provide: CreateMenuService,
        useFactory: (port: CreateMenuPort) => new CreateMenuService(port),
        deps: [CreateMenuPort],
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
      {
        provide: UpdateMenuItemNodePort,
        useClass: HttpUpdateMenuItemNodeAdapter,
      },
      {
        provide: UpdateMenuItemNodeService,
        useFactory: (port: UpdateMenuItemNodePort) =>
          new UpdateMenuItemNodeService(port),
        deps: [UpdateMenuItemNodePort],
      },
      {
        provide: ResetMenuItemTreePort,
        useClass: HttpResetMenuItemTreeAdapter,
      },
      {
        provide: ResetMenuItemTreeService,
        useFactory: (port: ResetMenuItemTreePort) =>
          new ResetMenuItemTreeService(port),
        deps: [ResetMenuItemTreePort],
      },
      {
        provide: UpdateMenuDetailsPort,
        useClass: HttpUpdateMenuDetailsAdapter,
      },
      {
        provide: UpdateMenuDetailsService,
        useFactory: (port: UpdateMenuDetailsPort) =>
          new UpdateMenuDetailsService(port),
        deps: [UpdateMenuDetailsPort],
      },
      { provide: SaveMenuItemPort, useClass: HttpSaveMenuItemAdapter },
      {
        provide: SaveMenuItemService,
        useFactory: (port: SaveMenuItemPort) => new SaveMenuItemService(port),
        deps: [SaveMenuItemPort],
      },
    ];
  }
}
