import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateQuickDiaryEntryPort } from "../../domain/ports/update-quick-diary-entry.port";
import { QuickDiaryEntryPayload } from "../../domain/models/quick-diary-entry.model";

@Injectable()
export class HttpUpdateQuickDiaryEntryAdapter extends UpdateQuickDiaryEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  updateQuickDiaryEntry(
    id: string,
    payload: QuickDiaryEntryPayload,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/quick`, payload);
  }
}
