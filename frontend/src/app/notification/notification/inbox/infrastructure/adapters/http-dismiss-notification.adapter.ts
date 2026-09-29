import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { DismissNotificationPort } from "../../domain/ports/dismiss-notification.port";

@Injectable()
export class HttpDismissNotificationAdapter implements DismissNotificationPort {
  private http = inject(HttpClient);

  dismiss(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/notification/notifications/${id}`);
  }
}
