import { Observable } from "rxjs";
import { CreateQuickDiaryEntryPort } from "../../domain/ports/create-quick-diary-entry.port";
import { CreateQuickDiaryEntryRequest } from "../../domain/models/quick-diary-entry.model";

export class CreateQuickDiaryEntryService {
  constructor(private createQuickDiaryEntryPort: CreateQuickDiaryEntryPort) {}

  createQuickDiaryEntry(
    request: CreateQuickDiaryEntryRequest,
  ): Observable<void> {
    return this.createQuickDiaryEntryPort.createQuickDiaryEntry(request);
  }
}
