import { Observable } from "rxjs";
import { QuickDiaryEntryPayload } from "../models/quick-diary-entry.model";

export abstract class UpdateQuickDiaryEntryPort {
  abstract updateQuickDiaryEntry(
    id: string,
    payload: QuickDiaryEntryPayload,
  ): Observable<void>;
}
