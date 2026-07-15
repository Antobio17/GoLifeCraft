import { Observable } from "rxjs";
import { CreateDiaryEntryPort } from "../../domain/ports/create-diary-entry.port";
import { CreateDiaryEntryRequest } from "../../domain/models/create-diary-entry.model";

export class CreateDiaryEntryService {
  constructor(private createDiaryEntryPort: CreateDiaryEntryPort) {}

  createDiaryEntry(request: CreateDiaryEntryRequest): Observable<void> {
    return this.createDiaryEntryPort.createDiaryEntry(request);
  }
}
