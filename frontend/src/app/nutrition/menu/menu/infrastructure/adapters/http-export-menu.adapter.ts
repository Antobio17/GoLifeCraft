import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { Theme } from "@shared/theme/domain/models/theme.model";
import { ExportMenuPort } from "@nutrition/menu/menu/domain/ports/export-menu.port";
import { MenuDocument } from "@nutrition/menu/menu/domain/models/menu-document.model";

@Injectable()
export class HttpExportMenuAdapter extends ExportMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";
  private readonly fallbackFileName = "menu.pdf";
  private readonly mimeType = "application/pdf";

  exportMenu(
    menuId: string,
    language: string,
    theme: Theme,
  ): Observable<MenuDocument> {
    return this.http
      .get(`${this.apiUrl}/${menuId}/export`, {
        params: new HttpParams().set("lang", language).set("theme", theme),
        responseType: "blob",
        observe: "response",
      })
      .pipe(
        map((response: HttpResponse<Blob>) => ({
          fileName: this.readFileName(
            response.headers.get("content-disposition"),
          ),
          mimeType: this.mimeType,
          content: new Blob([response.body ?? new Blob()], {
            type: this.mimeType,
          }),
        })),
      );
  }

  private readFileName(contentDisposition: string | null): string {
    const match = contentDisposition?.match(/filename="?([^";]+)"?/i);

    if (!match) return this.fallbackFileName;

    return match[1].toLowerCase().endsWith(".pdf")
      ? match[1]
      : `${match[1]}.pdf`;
  }
}
