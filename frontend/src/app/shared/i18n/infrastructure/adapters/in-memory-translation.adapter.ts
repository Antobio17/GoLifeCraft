import { Injectable } from "@angular/core";
import { Observable, from, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { TranslationPort } from "../../domain/ports/translation.port";
import { TranslationMap } from "../../domain/models/translation.model";

@Injectable()
export class InMemoryTranslationAdapter implements TranslationPort {
  loadTranslations(
    modulePath: string,
    language: string,
  ): Observable<TranslationMap> {
    return from(this.loadTranslationFile(modulePath, language)).pipe(
      catchError(() => {
        return of({} as TranslationMap);
      }),
    );
  }

  private async loadTranslationFile(
    modulePath: string,
    language: string,
  ): Promise<TranslationMap> {
    try {
      const translations = await import(
        `../../../../${modulePath}/infrastructure/translations/${language}.json`
      );

      return translations.default || translations;
    } catch (error) {
      throw new Error(
        `Failed to load translations for ${modulePath}/${language}`,
      );
    }
  }
}
