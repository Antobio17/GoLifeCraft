import { Observable } from "rxjs";

export abstract class DismissNotificationPort {
  abstract dismiss(id: string): Observable<void>;
}
