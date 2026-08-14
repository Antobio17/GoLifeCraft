import { Observable, tap } from "rxjs";
import { TranslationService } from "@shared/i18n/application/services/translation.service";
import { FileDownloadService } from "@shared/file-download/application/services/file-download.service";
import { ExportMenuPort } from "@nutrition/menu/menu/domain/ports/export-menu.port";
import { MenuDocument } from "@nutrition/menu/menu/domain/models/menu-document.model";

export class ExportMenuService {
  constructor(
    private exportMenuPort: ExportMenuPort,
    private translationService: TranslationService,
    private fileDownloadService: FileDownloadService,
  ) {}

  exportMenu(menuId: string): Observable<MenuDocument> {
    return this.exportMenuPort
      .exportMenu(menuId, this.translationService.getCurrentLanguage())
      .pipe(
        tap((document) =>
          this.fileDownloadService.save(
            document.content,
            document.fileName,
            document.mimeType,
          ),
        ),
      );
  }
}
