import { Injectable, NgZone, inject } from "@angular/core";
import { Observable } from "rxjs";

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

@Injectable({ providedIn: "root" })
export class IdleSchedulerService {
  private zone = inject(NgZone);

  whenIdle(timeout = 2500): Observable<void> {
    return new Observable<void>((subscriber) => {
      const emit = () =>
        this.zone.run(() => {
          subscriber.next();
          subscriber.complete();
        });

      const idleWindow = window as IdleWindow;

      if (!idleWindow.requestIdleCallback) {
        const handle = this.zone.runOutsideAngular(() =>
          setTimeout(emit, timeout),
        );

        return () => clearTimeout(handle);
      }

      const handle = this.zone.runOutsideAngular(() =>
        idleWindow.requestIdleCallback!(emit, { timeout }),
      );

      return () => idleWindow.cancelIdleCallback?.(handle);
    });
  }
}
