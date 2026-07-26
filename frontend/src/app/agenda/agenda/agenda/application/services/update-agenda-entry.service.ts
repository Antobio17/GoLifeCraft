import { Observable } from "rxjs";
import { UpdateAgendaEntryPort } from "../../domain/ports/update-agenda-entry.port";
import { AgendaEntryPayload } from "../../domain/models/agenda-entry-payload.model";

export class UpdateAgendaEntryService {
  constructor(private updateAgendaEntryPort: UpdateAgendaEntryPort) {}

  updateAgendaEntry(
    agendaEntryId: string,
    payload: AgendaEntryPayload,
  ): Observable<void> {
    return this.updateAgendaEntryPort.updateAgendaEntry(agendaEntryId, payload);
  }
}
