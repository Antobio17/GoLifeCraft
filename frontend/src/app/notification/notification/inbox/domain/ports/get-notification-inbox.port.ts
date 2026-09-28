import { Observable } from "rxjs";
import { GetNotificationInboxResponse } from "../models/get-notification-inbox-response.model";

export abstract class GetNotificationInboxPort {
  abstract getInbox(
    page: number,
    pageSize: number,
  ): Observable<GetNotificationInboxResponse>;
}
