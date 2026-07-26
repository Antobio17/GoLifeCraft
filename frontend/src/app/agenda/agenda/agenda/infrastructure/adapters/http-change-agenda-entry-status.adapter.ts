import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ChangeAgendaEntryStatusPort } from "../../domain/ports/change-agenda-entry-status.port";

@Injectable()
export class HttpChangeAgendaEntryStatusAdapter extends ChangeAgendaEntryStatusPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/agenda";

  changeAgendaEntryStatus(
    agendaEntryId: string,
    done: boolean,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${agendaEntryId}/status`, {
      done,
    });
  }
}
