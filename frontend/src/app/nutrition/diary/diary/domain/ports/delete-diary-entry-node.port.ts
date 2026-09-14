import { Observable } from "rxjs";

export abstract class DeleteDiaryEntryNodePort {
  abstract deleteDiaryEntryNode(id: string, path: string): Observable<void>;
}
