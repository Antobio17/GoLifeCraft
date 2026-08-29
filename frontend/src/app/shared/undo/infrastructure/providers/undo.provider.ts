import { DestroyRef, Provider, inject } from "@angular/core";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { UndoService } from "../../application/services/undo.service";

export class UndoProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: UndoService,
        useFactory: () => {
          const undoService = new UndoService(inject(FloatingToastService));
          inject(DestroyRef).onDestroy(() => undoService.dispose());

          return undoService;
        },
      },
    ];
  }
}
