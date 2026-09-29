import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ChangeNotificationReadStatePort } from "../../domain/ports/change-notification-read-state.port";

@Injectable()
export class HttpChangeNotificationReadStateAdapter implements ChangeNotificationReadStatePort {
  private http = inject(HttpClient);

  changeReadState(id: string, read: boolean): Observable<void> {
    return this.http.put<void>(
      `/api/v1/notification/notifications/${id}/read`,
      { read },
    );
  }
}
