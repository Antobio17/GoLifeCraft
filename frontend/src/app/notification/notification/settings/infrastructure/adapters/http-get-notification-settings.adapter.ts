import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { GetNotificationSettingsPort } from "../../domain/ports/get-notification-settings.port";
import { GetNotificationSettingsResponse } from "../../domain/models/get-notification-settings-response.model";

@Injectable()
export class HttpGetNotificationSettingsAdapter implements GetNotificationSettingsPort {
  private http = inject(HttpClient);

  getSettings(): Observable<GetNotificationSettingsResponse> {
    return this.http.get<GetNotificationSettingsResponse>(
      "/api/v1/notification/settings",
    );
  }
}
