import { PushNotificationsConfig } from "./push-notifications-config.model";

export interface GetPushNotificationsConfigResponse {
  data: {
    id: string;
    type: string;
    attributes: PushNotificationsConfig;
  };
}
