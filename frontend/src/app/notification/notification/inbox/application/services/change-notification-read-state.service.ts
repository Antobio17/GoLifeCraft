import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { ChangeNotificationReadStatePort } from "../../domain/ports/change-notification-read-state.port";

export class ChangeNotificationReadStateService {
  private port = inject(ChangeNotificationReadStatePort);

  changeReadState(id: string, read: boolean): Observable<void> {
    return this.port.changeReadState(id, read);
  }
}
