import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateDiaryEntryPort } from "../../domain/ports/create-diary-entry.port";
import { CreateDiaryEntryRequest } from "../../domain/models/create-diary-entry.model";

@Injectable()
export class HttpCreateDiaryEntryAdapter extends CreateDiaryEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/diary";

  createDiaryEntry(request: CreateDiaryEntryRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }
}
