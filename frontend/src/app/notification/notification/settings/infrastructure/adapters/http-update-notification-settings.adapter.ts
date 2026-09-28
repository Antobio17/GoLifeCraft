import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { UpdateNotificationSettingsPort } from "../../domain/ports/update-notification-settings.port";
import { UpdateNotificationSettingsRequest } from "../../domain/models/update-notification-settings-request.model";

@Injectable()
export class HttpUpdateNotificationSettingsAdapter implements UpdateNotificationSettingsPort {
  private http = inject(HttpClient);

  updateSettings(request: UpdateNotificationSettingsRequest): Observable<void> {
    return this.http.put<void>("/api/v1/notification/settings", request);
  }
}
