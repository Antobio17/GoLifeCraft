import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams, HttpResponse } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { ExportMenuPort } from "@nutrition/menu/menu/domain/ports/export-menu.port";
import { MenuDocument } from "@nutrition/menu/menu/domain/models/menu-document.model";

@Injectable()
export class HttpExportMenuAdapter extends ExportMenuPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/menu";
  private readonly fallbackFileName = "menu.pdf";

  exportMenu(menuId: string, language: string): Observable<MenuDocument> {
    return this.http
      .get(`${this.apiUrl}/${menuId}/export`, {
        params: new HttpParams().set("lang", language),
        responseType: "blob",
        observe: "response",
      })
      .pipe(
        map((response: HttpResponse<Blob>) => ({
          fileName: this.readFileName(
            response.headers.get("content-disposition"),
          ),
          content: response.body ?? new Blob(),
        })),
      );
  }

  private readFileName(contentDisposition: string | null): string {
    const match = contentDisposition?.match(/filename="?([^";]+)"?/i);

    return match ? match[1] : this.fallbackFileName;
  }
}
