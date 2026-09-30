import { inject, signal } from "@angular/core";
import { catchError, of } from "rxjs";
import { GetUnreadNotificationsCountPort } from "../../domain/ports/get-unread-notifications-count.port";

export class UnreadNotificationsService {
  private port = inject(GetUnreadNotificationsCountPort);

  private readonly unread = signal(0);

  readonly count = this.unread.asReadonly();

  refresh(): void {
    this.port
      .getUnreadCount()
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) return;

        this.unread.set(response.data.attributes.count);
      });
  }

  sync(count: number): void {
    this.unread.set(count);
  }

  clear(): void {
    this.unread.set(0);
  }
}
