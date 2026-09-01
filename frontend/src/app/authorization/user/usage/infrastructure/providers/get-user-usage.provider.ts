import { Provider } from "@angular/core";
import { GetUserUsagePort } from "../../domain/ports/get-user-usage.port";
import { HttpGetUserUsageAdapter } from "../adapters/http-get-user-usage.adapter";
import { GetUserUsageService } from "../../application/services/get-user-usage.service";

export class GetUserUsageProvider {
  static getProviders(): Provider[] {
    return [
      { provide: GetUserUsagePort, useClass: HttpGetUserUsageAdapter },
      {
        provide: GetUserUsageService,
        useFactory: (port: GetUserUsagePort) => new GetUserUsageService(port),
        deps: [GetUserUsagePort],
      },
    ];
  }
}
