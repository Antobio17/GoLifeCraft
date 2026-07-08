import { Observable } from "rxjs";

export abstract class DeleteSessionPort {
  abstract deleteSession(id: string): Observable<void>;
}
