import { Observable } from "rxjs";
import { ResetDiaryEntryTreePort } from "../../domain/ports/reset-diary-entry-tree.port";

export class ResetDiaryEntryTreeService {
  constructor(private resetDiaryEntryTreePort: ResetDiaryEntryTreePort) {}

  resetDiaryEntryTree(id: string): Observable<void> {
    return this.resetDiaryEntryTreePort.resetDiaryEntryTree(id);
  }
}
