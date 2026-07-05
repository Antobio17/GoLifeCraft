import { Provider } from "@angular/core";
import { FloatingToastService } from "../../application/services/floating-toast.service";

export class FloatingToastProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: FloatingToastService,
        useClass: FloatingToastService,
      },
    ];
  }
}
