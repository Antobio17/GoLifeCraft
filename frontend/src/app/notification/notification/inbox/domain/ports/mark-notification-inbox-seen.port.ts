import { Observable } from "rxjs";

export abstract class MarkNotificationInboxSeenPort {
  abstract markSeen(): Observable<void>;
}
