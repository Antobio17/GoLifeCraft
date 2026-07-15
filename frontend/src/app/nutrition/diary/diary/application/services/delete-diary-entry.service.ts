import { Observable } from "rxjs";
import { DeleteDiaryEntryPort } from "../../domain/ports/delete-diary-entry.port";

export class DeleteDiaryEntryService {
  constructor(private deleteDiaryEntryPort: DeleteDiaryEntryPort) {}

  deleteDiaryEntry(id: string): Observable<void> {
    return this.deleteDiaryEntryPort.deleteDiaryEntry(id);
  }
}
