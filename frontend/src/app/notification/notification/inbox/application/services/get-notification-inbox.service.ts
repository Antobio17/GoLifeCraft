import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetNotificationInboxPort } from "../../domain/ports/get-notification-inbox.port";
import { GetNotificationInboxResponse } from "../../domain/models/get-notification-inbox-response.model";

export class GetNotificationInboxService {
  private port = inject(GetNotificationInboxPort);

  getInbox(page = 1, pageSize = 30): Observable<GetNotificationInboxResponse> {
    return this.port.getInbox(page, pageSize);
  }
}
