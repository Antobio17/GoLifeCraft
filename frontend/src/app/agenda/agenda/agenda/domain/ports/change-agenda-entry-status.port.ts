import { Observable } from "rxjs";

export abstract class ChangeAgendaEntryStatusPort {
  abstract changeAgendaEntryStatus(
    agendaEntryId: string,
    done: boolean,
  ): Observable<void>;
}
