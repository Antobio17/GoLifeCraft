import { DestroyRef, Provider, inject } from "@angular/core";
import { AutosaveService } from "../../application/services/autosave.service";
import { AutosaveExitWarningService } from "../services/autosave-exit-warning.service";

export class AutosaveProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: AutosaveService,
        useFactory: () => {
          const autosaveService = new AutosaveService();
          const destroyRef = inject(DestroyRef);

          inject(AutosaveExitWarningService).watch(autosaveService, destroyRef);
          destroyRef.onDestroy(() => autosaveService.dispose());

          return autosaveService;
        },
      },
    ];
  }
}
