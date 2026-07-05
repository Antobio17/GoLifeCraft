import { Provider } from "@angular/core";
import { UpdateThemePort } from "../../domain/ports/update-theme.port";
import { HttpUpdateThemeAdapter } from "../adapters/http-update-theme.adapter";
import { ThemeService } from "../../application/services/theme.service";

export class ThemeProvider {
  static getProviders(): Provider[] {
    return [
      { provide: UpdateThemePort, useClass: HttpUpdateThemeAdapter },
      {
        provide: ThemeService,
        useFactory: (port: UpdateThemePort) => new ThemeService(port),
        deps: [UpdateThemePort],
      },
    ];
  }
}
