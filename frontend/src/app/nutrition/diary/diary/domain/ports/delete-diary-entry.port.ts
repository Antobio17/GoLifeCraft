import { Observable } from "rxjs";

export abstract class DeleteDiaryEntryPort {
  abstract deleteDiaryEntry(id: string): Observable<void>;
}
