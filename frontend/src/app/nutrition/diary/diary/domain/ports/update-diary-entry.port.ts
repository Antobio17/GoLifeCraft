import { Observable } from "rxjs";

export abstract class UpdateDiaryEntryPort {
  abstract updateDiaryEntryQuantity(
    id: string,
    quantity: number,
  ): Observable<void>;
}
