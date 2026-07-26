import { Observable } from "rxjs";

export abstract class DeleteAgendaEntryPort {
  abstract deleteAgendaEntry(agendaEntryId: string): Observable<void>;
}
