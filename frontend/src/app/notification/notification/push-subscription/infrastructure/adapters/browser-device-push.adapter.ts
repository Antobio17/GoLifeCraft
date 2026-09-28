import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { Observable, defer, from, map, of, switchMap, timeout } from "rxjs";
import { DevicePushPort } from "../../domain/ports/device-push.port";
import { DevicePushSubscription } from "../../domain/models/device-push-subscription.model";
import { PushPermissionDeniedError } from "../../domain/errors/push-permission-denied.error";

@Injectable()
export class BrowserDevicePushAdapter implements DevicePushPort {
  private readonly window = inject(DOCUMENT).defaultView;

  private readonly SCRIPT_URL = "/push-sw.js";
  private readonly SCOPE = "/";
  private readonly PREFERRED_ENCODING = "aes128gcm";
  private readonly FALLBACK_ENCODING = "aesgcm";
  private readonly SUBSCRIBE_TIMEOUT_MS = 20000;

  isStandalone(): boolean {
    if (!this.window) return false;

    const navigator = this.window.navigator as Navigator & {
      standalone?: boolean;
    };

    if (true === navigator.standalone) return true;

    return ["standalone", "fullscreen", "minimal-ui"].some(
      (mode) => this.window?.matchMedia(`(display-mode: ${mode})`).matches,
    );
  }

  isSupported(): boolean {
    if (!this.window) return false;

    return (
      "serviceWorker" in this.window.navigator &&
      "PushManager" in this.window &&
      "Notification" in this.window
    );
  }

  permission(): NotificationPermission {
    if (!this.isSupported()) return "denied";

    return this.window!.Notification.permission;
  }

  current(): Observable<DevicePushSubscription | null> {
    if (!this.isSupported()) return of(null);

    return from(
      this.window!.navigator.serviceWorker.getRegistration(this.SCOPE),
    ).pipe(
      switchMap((registration) =>
        registration
          ? from(registration.pushManager.getSubscription())
          : of(null),
      ),
      map((subscription) =>
        subscription ? this.toDevice(subscription) : null,
      ),
    );
  }

  subscribe(vapidPublicKey: string): Observable<DevicePushSubscription> {
    const permission = this.window!.Notification.requestPermission();
    const applicationServerKey = this.decodeKey(vapidPublicKey);

    return from(permission).pipe(
      switchMap((result) => {
        if ("granted" !== result) throw new PushPermissionDeniedError();

        return from(this.register());
      }),
      switchMap((registration) =>
        from(this.subscribeWith(registration, applicationServerKey)).pipe(
          timeout(this.SUBSCRIBE_TIMEOUT_MS),
        ),
      ),
      map((subscription) => this.toDevice(subscription)),
    );
  }

  unsubscribe(): Observable<string | null> {
    return this.current().pipe(
      switchMap((device) => {
        if (!device) return of(null);

        return defer(() => this.dropSubscription()).pipe(
          map(() => device.endpoint),
        );
      }),
    );
  }

  private async register(): Promise<ServiceWorkerRegistration> {
    const serviceWorker = this.window!.navigator.serviceWorker;
    await serviceWorker.register(this.SCRIPT_URL, { scope: this.SCOPE });

    return serviceWorker.ready;
  }

  private async subscribeWith(
    registration: ServiceWorkerRegistration,
    applicationServerKey: Uint8Array<ArrayBuffer>,
  ): Promise<PushSubscription> {
    const existing = await registration.pushManager.getSubscription();

    if (existing && this.sameKey(existing, applicationServerKey)) {
      return existing;
    }

    await existing?.unsubscribe();

    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  private async dropSubscription(): Promise<void> {
    const registration =
      await this.window!.navigator.serviceWorker.getRegistration(this.SCOPE);
    const subscription = await registration?.pushManager.getSubscription();

    await subscription?.unsubscribe();
  }

  private sameKey(
    subscription: PushSubscription,
    applicationServerKey: Uint8Array<ArrayBuffer>,
  ): boolean {
    const current = subscription.options.applicationServerKey;

    if (!current) return false;

    const bytes = new Uint8Array(current);

    return (
      bytes.length === applicationServerKey.length &&
      bytes.every((byte, index) => byte === applicationServerKey[index])
    );
  }

  private toDevice(subscription: PushSubscription): DevicePushSubscription {
    const keys = subscription.toJSON().keys ?? {};

    return {
      endpoint: subscription.endpoint,
      publicKey: keys["p256dh"] ?? "",
      authToken: keys["auth"] ?? "",
      contentEncoding: this.contentEncoding(),
    };
  }

  private contentEncoding(): string {
    const supported = (
      this.window as
        | (Window & { PushManager?: { supportedContentEncodings?: string[] } })
        | null
    )?.PushManager?.supportedContentEncodings;

    return supported?.includes(this.PREFERRED_ENCODING)
      ? this.PREFERRED_ENCODING
      : this.FALLBACK_ENCODING;
  }

  private decodeKey(base64Url: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = this.window!.atob(base64);

    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
  }
}
