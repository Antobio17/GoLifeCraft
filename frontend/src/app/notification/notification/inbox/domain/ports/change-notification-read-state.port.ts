import { Observable } from "rxjs";

export abstract class ChangeNotificationReadStatePort {
  abstract changeReadState(id: string, read: boolean): Observable<void>;
}
