import { Observable } from "rxjs";
import { GetPushNotificationsConfigPort } from "../../domain/ports/get-push-notifications-config.port";
import { GetPushNotificationsConfigResponse } from "../../domain/models/get-push-notifications-config-response.model";

export class GetPushNotificationsConfigService {
  constructor(private port: GetPushNotificationsConfigPort) {}

  getConfig(): Observable<GetPushNotificationsConfigResponse> {
    return this.port.getConfig();
  }
}
