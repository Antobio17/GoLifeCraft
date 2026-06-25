import { Provider } from "@angular/core";
import { TranslationPort } from "../../domain/ports/translation.port";
import { InMemoryTranslationAdapter } from "../adapters/in-memory-translation.adapter";
import { TranslationService } from "../../application/services/translation.service";

export class TranslationProvider {
  static getProviders(): Provider[] {
    return [
      {
        provide: TranslationPort,
        useClass: InMemoryTranslationAdapter,
      },
      {
        provide: TranslationService,
        useFactory: (translationPort: TranslationPort) =>
          new TranslationService(translationPort),
        deps: [TranslationPort],
      },
    ];
  }
}
