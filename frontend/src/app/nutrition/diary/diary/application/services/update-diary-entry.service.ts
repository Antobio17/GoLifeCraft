import { Observable } from "rxjs";
import { UpdateDiaryEntryPort } from "../../domain/ports/update-diary-entry.port";

export class UpdateDiaryEntryService {
  constructor(private updateDiaryEntryPort: UpdateDiaryEntryPort) {}

  updateDiaryEntryQuantity(id: string, quantity: number): Observable<void> {
    return this.updateDiaryEntryPort.updateDiaryEntryQuantity(id, quantity);
  }
}
