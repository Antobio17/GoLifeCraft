import { Provider } from "@angular/core";
import { RefreshTokenPort } from "../../domain/ports/refresh-token.port";
import { HttpRefreshTokenAdapter } from "../adapters/http-refresh-token.adapter";
import { SessionRefreshService } from "../../application/services/session-refresh.service";

export class RefreshTokenProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: RefreshTokenPort,
        useClass: HttpRefreshTokenAdapter,
      },
      {
        provide: SessionRefreshService,
        useClass: SessionRefreshService,
      },
    ];
  }
}
