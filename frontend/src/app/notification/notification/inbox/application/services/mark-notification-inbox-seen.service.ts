import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { MarkNotificationInboxSeenPort } from "../../domain/ports/mark-notification-inbox-seen.port";

export class MarkNotificationInboxSeenService {
  private port = inject(MarkNotificationInboxSeenPort);

  markSeen(): Observable<void> {
    return this.port.markSeen();
  }
}
