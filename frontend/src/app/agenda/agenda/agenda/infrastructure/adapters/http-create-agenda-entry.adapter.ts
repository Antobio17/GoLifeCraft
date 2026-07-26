import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateAgendaEntryPort } from "../../domain/ports/create-agenda-entry.port";
import { AgendaEntryPayload } from "../../domain/models/agenda-entry-payload.model";

@Injectable()
export class HttpCreateAgendaEntryAdapter extends CreateAgendaEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda";

  createAgendaEntry(payload: AgendaEntryPayload): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }
}
