import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateDiaryEntryNodePort } from "../../domain/ports/update-diary-entry-node.port";

@Injectable()
export class HttpUpdateDiaryEntryNodeAdapter extends UpdateDiaryEntryNodePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  updateDiaryEntryNode(
    id: string,
    path: string,
    quantity: number,
    unit?: string,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/nodes/${path}`, {
      quantity,
      unit: unit ?? null,
    });
  }
}
