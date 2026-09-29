import { Provider } from "@angular/core";
import { ChangeNotificationReadStatePort } from "../../domain/ports/change-notification-read-state.port";
import { HttpChangeNotificationReadStateAdapter } from "../adapters/http-change-notification-read-state.adapter";
import { ChangeNotificationReadStateService } from "../../application/services/change-notification-read-state.service";

export class ChangeNotificationReadStateProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: ChangeNotificationReadStatePort,
        useClass: HttpChangeNotificationReadStateAdapter,
      },
      ChangeNotificationReadStateService,
    ];
  }
}
