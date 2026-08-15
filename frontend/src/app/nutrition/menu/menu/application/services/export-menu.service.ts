import { Observable, from, map, switchMap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FileDownloadService } from "@shared/file-download/application/services/file-download.service";
import { ThemeService } from "@shared/theme/application/services/theme.service";
import { ExportMenuPort } from "@nutrition/menu/menu/domain/ports/export-menu.port";
import { MenuDocument } from "@nutrition/menu/menu/domain/models/menu-document.model";

export class ExportMenuService {
  constructor(
    private exportMenuPort: ExportMenuPort,
    private translationService: TranslationService,
    private fileDownloadService: FileDownloadService,
    private themeService: ThemeService,
  ) {}

  exportMenu(menuId: string): Observable<MenuDocument> {
    return this.exportMenuPort
      .exportMenu(
        menuId,
        this.translationService.getCurrentLanguage(),
        this.themeService.getCurrentTheme(),
      )
      .pipe(switchMap((document) => this.save(document)));
  }

  private save(document: MenuDocument): Observable<MenuDocument> {
    return from(
      this.fileDownloadService.save(
        document.content,
        document.fileName,
        document.mimeType,
      ),
    ).pipe(map(() => document));
  }
}
