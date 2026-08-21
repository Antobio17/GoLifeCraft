import { DestroyRef, Injectable } from "@angular/core";
import { AutosaveService } from "../../application/services/autosave.service";

/**
 * `dispose()` cubre salir de la pantalla, pero cerrar o recargar la pestaña no pasa por
 * el ciclo de vida de Angular: ahí sólo queda avisar antes de que el cambio se pierda.
 */
@Injectable({ providedIn: "root" })
export class AutosaveExitWarningService {
  watch(autosaveService: AutosaveService, destroyRef: DestroyRef): void {
    const warnIfUnsaved = (event: BeforeUnloadEvent): void => {
      if (!autosaveService.hasPendingWork() && !autosaveService.hasFailures()) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("beforeunload", warnIfUnsaved);
    destroyRef.onDestroy(() =>
      window.removeEventListener("beforeunload", warnIfUnsaved),
    );
  }
}
