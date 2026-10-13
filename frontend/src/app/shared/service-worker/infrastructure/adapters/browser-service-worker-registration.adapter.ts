import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";
import { ServiceWorkerRegistrationPort } from "../../domain/ports/service-worker-registration.port";

@Injectable()
export class BrowserServiceWorkerRegistrationAdapter extends ServiceWorkerRegistrationPort {
  private readonly document = inject(DOCUMENT);

  private readonly SCRIPT_URL = "/push-sw.js";
  private readonly SCOPE = "/";

  registerWhenLoaded(): void {
    const view = this.document.defaultView;

    if (!view || !("serviceWorker" in view.navigator)) return;

    if ("complete" === this.document.readyState) {
      this.register(view.navigator.serviceWorker);

      return;
    }

    view.addEventListener(
      "load",
      () => this.register(view.navigator.serviceWorker),
      { once: true },
    );
  }

  private register(serviceWorker: ServiceWorkerContainer): void {
    serviceWorker
      .register(this.SCRIPT_URL, { scope: this.SCOPE })
      .catch(() => undefined);
  }
}
