import { Provider } from "@angular/core";
import { ServiceWorkerRegistrationPort } from "@shared/service-worker/domain/ports/service-worker-registration.port";
import { ServiceWorkerRegistrationService } from "@shared/service-worker/application/services/service-worker-registration.service";
import { BrowserServiceWorkerRegistrationAdapter } from "../adapters/browser-service-worker-registration.adapter";

export class ServiceWorkerRegistrationProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ServiceWorkerRegistrationPort,
        useClass: BrowserServiceWorkerRegistrationAdapter,
      },
      ServiceWorkerRegistrationService,
    ];
  }
}
