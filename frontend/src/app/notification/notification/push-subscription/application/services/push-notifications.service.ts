import { Injectable, computed, inject, signal } from "@angular/core";
import {
  EMPTY,
  Observable,
  catchError,
  finalize,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from "rxjs";
import { DevicePushPort } from "../../domain/ports/device-push.port";
import { PushAvailability } from "../../domain/models/push-availability.enum";
import { PushNotificationsConfig } from "../../domain/models/push-notifications-config.model";
import { SendTestPushNotificationRequest } from "../../domain/models/send-test-push-notification-request.model";
import { GetPushNotificationsConfigService } from "./get-push-notifications-config.service";
import { SubscribeToPushNotificationsService } from "./subscribe-to-push-notifications.service";
import { UnsubscribeFromPushNotificationsService } from "./unsubscribe-from-push-notifications.service";
import { SendTestPushNotificationService } from "./send-test-push-notification.service";

@Injectable()
export class PushNotificationsService {
  private readonly device = inject(DevicePushPort);
  private readonly getConfigService = inject(GetPushNotificationsConfigService);
  private readonly subscribeService = inject(
    SubscribeToPushNotificationsService,
  );
  private readonly unsubscribeService = inject(
    UnsubscribeFromPushNotificationsService,
  );
  private readonly sendTestService = inject(SendTestPushNotificationService);

  private readonly standalone = this.device.isStandalone();
  private readonly supported = this.device.isSupported();
  private readonly config = signal<PushNotificationsConfig | null>(null);
  private readonly permission = signal<NotificationPermission>(
    this.device.permission(),
  );

  readonly subscribed = signal(false);
  readonly busy = signal(false);

  readonly availability = computed<PushAvailability>(() => {
    if (!this.standalone) return PushAvailability.NotStandalone;
    if (!this.supported) return PushAvailability.Unsupported;

    const config = this.config();

    if (null === config) return PushAvailability.Loading;
    if (!config.enabled || !config.vapidPublicKey) {
      return PushAvailability.NotConfigured;
    }
    if ("denied" === this.permission()) return PushAvailability.Denied;

    return PushAvailability.Ready;
  });

  readonly enabled = computed(
    () => PushAvailability.Ready === this.availability() && this.subscribed(),
  );

  readonly toggleable = computed(
    () => PushAvailability.Ready === this.availability() && !this.busy(),
  );

  load(): Observable<void> {
    if (!this.standalone || !this.supported) return of(undefined);

    return this.getConfigService.getConfig().pipe(
      map((response) => response.data.attributes),
      catchError(() =>
        of<PushNotificationsConfig>({
          enabled: false,
          vapidPublicKey: null,
          subscriptions: 0,
        }),
      ),
      tap((config) => this.config.set(config)),
      switchMap((config) =>
        config.enabled
          ? this.device.current().pipe(catchError(() => of(null)))
          : of(null),
      ),
      tap((device) => this.subscribed.set(null !== device)),
      switchMap((device) =>
        device
          ? this.subscribeService
              .subscribe(device)
              .pipe(catchError(() => of(undefined)))
          : of(undefined),
      ),
    );
  }

  enable(): Observable<void> {
    const vapidPublicKey = this.config()?.vapidPublicKey;

    if (!this.toggleable() || !vapidPublicKey) return EMPTY;

    this.busy.set(true);

    return this.device.subscribe(vapidPublicKey).pipe(
      switchMap((device) => this.subscribeService.subscribe(device)),
      tap(() => this.subscribed.set(true)),
      catchError((error) => {
        this.permission.set(this.device.permission());

        return throwError(() => error);
      }),
      finalize(() => this.busy.set(false)),
    );
  }

  disable(): Observable<void> {
    if (!this.toggleable()) return EMPTY;

    this.busy.set(true);

    return this.device.unsubscribe().pipe(
      switchMap((endpoint) =>
        endpoint
          ? this.unsubscribeService.unsubscribe({ endpoint })
          : of(undefined),
      ),
      tap(() => this.subscribed.set(false)),
      finalize(() => this.busy.set(false)),
    );
  }

  sendTest(request: SendTestPushNotificationRequest): Observable<void> {
    return this.sendTestService.sendTest(request);
  }
}
