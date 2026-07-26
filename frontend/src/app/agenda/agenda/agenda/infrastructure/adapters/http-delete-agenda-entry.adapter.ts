import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DeleteAgendaEntryPort } from "../../domain/ports/delete-agenda-entry.port";

@Injectable()
export class HttpDeleteAgendaEntryAdapter extends DeleteAgendaEntryPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda";

  deleteAgendaEntry(agendaEntryId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${agendaEntryId}`);
  }
}
