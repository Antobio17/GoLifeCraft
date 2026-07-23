import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateQuickDiaryEntryPort } from "../../domain/ports/create-quick-diary-entry.port";
import { CreateQuickDiaryEntryRequest } from "../../domain/models/quick-diary-entry.model";

@Injectable()
export class HttpCreateQuickDiaryEntryAdapter extends CreateQuickDiaryEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary/quick";

  createQuickDiaryEntry(
    request: CreateQuickDiaryEntryRequest,
  ): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
