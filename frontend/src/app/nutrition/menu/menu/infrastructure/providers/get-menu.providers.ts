import { Provider } from "@angular/core";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FileDownloadService } from "@shared/file-download/application/services/file-download.service";
import { GetMenuPort } from "@nutrition/menu/menu/domain/ports/get-menu.port";
import { GetMenuShoppingNeedsPort } from "@nutrition/menu/menu/domain/ports/get-menu-shopping-needs.port";
import { ExportMenuPort } from "@nutrition/menu/menu/domain/ports/export-menu.port";
import { HttpGetMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-get-menu.adapter";
import { HttpGetMenuShoppingNeedsAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-get-menu-shopping-needs.adapter";
import { HttpExportMenuAdapter } from "@nutrition/menu/menu/infrastructure/adapters/http-export-menu.adapter";
import { GetMenuService } from "@nutrition/menu/menu/application/services/get-menu.service";
import { GetMenuShoppingNeedsService } from "@nutrition/menu/menu/application/services/get-menu-shopping-needs.service";
import { ExportMenuService } from "@nutrition/menu/menu/application/services/export-menu.service";

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
