import { Observable } from "rxjs";
import { TranslationMap } from "../models/translation.model";

export abstract class TranslationPort {
  abstract loadTranslations(
    modulePath: string,
    language: string,
  ): Observable<TranslationMap>;
}
