import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteDiaryEntryPort } from "../../domain/ports/delete-diary-entry.port";

@Injectable()
export class HttpDeleteDiaryEntryAdapter extends DeleteDiaryEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  deleteDiaryEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
