import { Observable } from "rxjs";
import { GetPushNotificationsConfigResponse } from "../models/get-push-notifications-config-response.model";

export abstract class GetPushNotificationsConfigPort {
  abstract getConfig(): Observable<GetPushNotificationsConfigResponse>;
}
