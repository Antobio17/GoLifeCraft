import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateDiaryEntryPort } from "../../domain/ports/update-diary-entry.port";

@Injectable()
export class HttpUpdateDiaryEntryAdapter extends UpdateDiaryEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  updateDiaryEntryQuantity(id: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { quantity });
  }
}
