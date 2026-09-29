import { Provider } from "@angular/core";
import { DismissNotificationPort } from "../../domain/ports/dismiss-notification.port";
import { HttpDismissNotificationAdapter } from "../adapters/http-dismiss-notification.adapter";
import { DismissNotificationService } from "../../application/services/dismiss-notification.service";

export class DismissNotificationProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: DismissNotificationPort,
        useClass: HttpDismissNotificationAdapter,
      },
      DismissNotificationService,
    ];
  }
}
