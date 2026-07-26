import { Observable } from "rxjs";
import { CreateAgendaEntryPort } from "../../domain/ports/create-agenda-entry.port";
import { AgendaEntryPayload } from "../../domain/models/agenda-entry-payload.model";

export class CreateAgendaEntryService {
  constructor(private createAgendaEntryPort: CreateAgendaEntryPort) {}

  createAgendaEntry(payload: AgendaEntryPayload): Observable<void> {
    return this.createAgendaEntryPort.createAgendaEntry(payload);
  }
}
