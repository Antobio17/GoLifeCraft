import { Provider } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FileDownloadService } from "@shared/file-download/application/services/file-download.service";
import { GetMenusPort } from "@nutrition/menu/menu/domain/ports/get-menus.port";
import { ExportMenuPort } from "@nutrition/menu/menu/domain/ports/export-menu.port";
import { HttpGetMenusAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-get-menus.adapter";
import { HttpExportMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-export-menu.adapter";
import { GetMenusService } from "@nutrition/menu/menu/application/services/get-menus.service";
import { ExportMenuService } from "@nutrition/menu/menu/application/services/export-menu.service";
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
      { provide: ExportMenuPort, useClass: HttpExportMenuAdapter },
      {
        provide: ExportMenuService,
        useFactory: (
          port: ExportMenuPort,
          translationService: TranslationService,
          fileDownloadService: FileDownloadService,
        ) =>
          new ExportMenuService(port, translationService, fileDownloadService),
        deps: [ExportMenuPort, TranslationService, FileDownloadService],
      },
    ];
  }
}
