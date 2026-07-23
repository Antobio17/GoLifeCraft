import { Observable } from "rxjs";
import { UpdateQuickDiaryEntryPort } from "../../domain/ports/update-quick-diary-entry.port";
import { QuickDiaryEntryPayload } from "../../domain/models/quick-diary-entry.model";

export class UpdateQuickDiaryEntryService {
  constructor(private updateQuickDiaryEntryPort: UpdateQuickDiaryEntryPort) {}

  updateQuickDiaryEntry(
    id: string,
    payload: QuickDiaryEntryPayload,
  ): Observable<void> {
    return this.updateQuickDiaryEntryPort.updateQuickDiaryEntry(id, payload);
  }
}
