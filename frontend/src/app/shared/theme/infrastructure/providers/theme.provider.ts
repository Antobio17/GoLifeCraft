import { EnvironmentProviders, Provider, inject, provideAppInitializer } from "@angular/core";
import { UpdateThemePort } from "../../domain/ports/update-theme.port";
import { HttpUpdateThemeAdapter } from "../adapters/http-update-theme.adapter";
import { ThemeService } from "../../application/services/theme.service";

export class ThemeProvider {
  static getProviders(): Array<Provider | EnvironmentProviders> {
    return [
      { provide: UpdateThemePort, useClass: HttpUpdateThemeAdapter },
      {
        provide: ThemeService,
        useFactory: (port: UpdateThemePort) => new ThemeService(port),
        deps: [UpdateThemePort],
      },
      provideAppInitializer(() => { inject(ThemeService); }),
    ];
  }
}
