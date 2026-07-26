import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateAgendaEntryPort } from "../../domain/ports/update-agenda-entry.port";
import { AgendaEntryPayload } from "../../domain/models/agenda-entry-payload.model";

@Injectable()
export class HttpUpdateAgendaEntryAdapter extends UpdateAgendaEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda";

  updateAgendaEntry(
    agendaEntryId: string,
    payload: AgendaEntryPayload,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${agendaEntryId}`, payload);
  }
}
