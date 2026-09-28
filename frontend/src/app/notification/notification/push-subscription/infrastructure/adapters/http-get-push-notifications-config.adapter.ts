import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetPushNotificationsConfigPort } from "../../domain/ports/get-push-notifications-config.port";
import { GetPushNotificationsConfigResponse } from "../../domain/models/get-push-notifications-config-response.model";

@Injectable()
export class HttpGetPushNotificationsConfigAdapter implements GetPushNotificationsConfigPort {
  private http = inject(HttpClient);

  getConfig(): Observable<GetPushNotificationsConfigResponse> {
    return this.http.get<GetPushNotificationsConfigResponse>(
      "/api/v1/notification/push",
    );
  }
}
