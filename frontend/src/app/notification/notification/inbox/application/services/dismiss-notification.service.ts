import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { DismissNotificationPort } from "../../domain/ports/dismiss-notification.port";

export class DismissNotificationService {
  private port = inject(DismissNotificationPort);

  dismiss(id: string): Observable<void> {
    return this.port.dismiss(id);
  }
}
