import { Observable } from "rxjs";
import { DeleteAgendaEntryPort } from "../../domain/ports/delete-agenda-entry.port";

export class DeleteAgendaEntryService {
  constructor(private deleteAgendaEntryPort: DeleteAgendaEntryPort) {}

  deleteAgendaEntry(agendaEntryId: string): Observable<void> {
    return this.deleteAgendaEntryPort.deleteAgendaEntry(agendaEntryId);
  }
}
