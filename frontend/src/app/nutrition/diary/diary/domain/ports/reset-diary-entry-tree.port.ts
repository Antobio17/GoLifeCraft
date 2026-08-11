import { Observable } from "rxjs";

export abstract class ResetDiaryEntryTreePort {
  abstract resetDiaryEntryTree(id: string): Observable<void>;
}
