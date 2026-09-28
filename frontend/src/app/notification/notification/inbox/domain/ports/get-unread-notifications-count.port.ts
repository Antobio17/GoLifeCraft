import { Observable } from "rxjs";
import { GetUnreadNotificationsCountResponse } from "../models/get-unread-notifications-count-response.model";

export abstract class GetUnreadNotificationsCountPort {
  abstract getUnreadCount(): Observable<GetUnreadNotificationsCountResponse>;
}
