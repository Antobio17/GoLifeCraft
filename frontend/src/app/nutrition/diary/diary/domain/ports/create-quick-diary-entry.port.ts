import { Observable } from "rxjs";
import { CreateQuickDiaryEntryRequest } from "../models/quick-diary-entry.model";

export abstract class CreateQuickDiaryEntryPort {
  abstract createQuickDiaryEntry(
    request: CreateQuickDiaryEntryRequest,
  ): Observable<void>;
}
