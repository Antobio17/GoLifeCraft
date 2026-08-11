import { Observable } from "rxjs";

export abstract class UpdateDiaryEntryNodePort {
  abstract updateDiaryEntryNode(
    id: string,
    path: string,
    quantity: number,
    unit?: string,
  ): Observable<void>;
}
