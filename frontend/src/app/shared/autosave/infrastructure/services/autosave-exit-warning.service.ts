import { DestroyRef, Injectable } from "@angular/core";
import { AutosaveService } from "../../application/services/autosave.service";

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
