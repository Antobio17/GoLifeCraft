import { Provider } from "@angular/core";
import { GetUsersUsagePort } from "../../domain/ports/get-users-usage.port";
import { HttpGetUsersUsageAdapter } from "../adapters/http-get-users-usage.adapter";
import { GetUsersUsageService } from "../../application/services/get-users-usage.service";

export class GetUsersUsageProvider {
  static getProviders(): Provider[] {
    return [
      { provide: GetUsersUsagePort, useClass: HttpGetUsersUsageAdapter },
      { provide: GetUsersUsageService, useClass: GetUsersUsageService },
    ];
  }
}
