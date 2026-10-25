import { inject, isDevMode } from "@angular/core";
import { ServiceWorkerRegistrationPort } from "../../domain/ports/service-worker-registration.port";

export class ServiceWorkerRegistrationService {
  private readonly port = inject(ServiceWorkerRegistrationPort);

  register(): void {
    if (isDevMode()) return;

    this.port.registerWhenLoaded();
  }
}
