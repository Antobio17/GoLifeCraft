import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ResetDiaryEntryTreePort } from "../../domain/ports/reset-diary-entry-tree.port";

@Injectable()
export class HttpResetDiaryEntryTreeAdapter extends ResetDiaryEntryTreePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  resetDiaryEntryTree(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/tree/reset`, {});
  }
}
