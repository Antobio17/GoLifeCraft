import { DestroyRef, Provider, inject } from "@angular/core";
import { UndoService } from "../../application/services/undo.service";

export class UndoProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: UndoService,
        useFactory: () => {
          const undoService = new UndoService();
          inject(DestroyRef).onDestroy(() => undoService.dispose());

          return undoService;
        },
      },
    ];
  }
}
