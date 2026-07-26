import { Observable } from "rxjs";
import { ChangeAgendaEntryStatusPort } from "../../domain/ports/change-agenda-entry-status.port";

export class ChangeAgendaEntryStatusService {
  constructor(
    private changeAgendaEntryStatusPort: ChangeAgendaEntryStatusPort,
  ) {}

  changeAgendaEntryStatus(
    agendaEntryId: string,
    done: boolean,
  ): Observable<void> {
    return this.changeAgendaEntryStatusPort.changeAgendaEntryStatus(
      agendaEntryId,
      done,
    );
  }
}
