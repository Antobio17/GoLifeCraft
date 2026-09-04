import { Provider } from "@angular/core";
import { UpdateVisualPreferencePort } from "@shared/visual-preference/domain/ports/update-visual-preference.port";
import { HttpUpdateVisualPreferenceAdapter } from "@shared/visual-preference/infrastructure/adapters/http-update-visual-preference.adapter";
import { VisualPreferenceService } from "@shared/visual-preference/application/services/visual-preference.service";

export class VisualPreferenceProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UpdateVisualPreferencePort,
        useClass: HttpUpdateVisualPreferenceAdapter,
      },
      {
        provide: VisualPreferenceService,
        useFactory: (port: UpdateVisualPreferencePort) =>
          new VisualPreferenceService(port),
        deps: [UpdateVisualPreferencePort],
      },
    ];
  }
}
