import { Component, computed, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslationService } from "../../application/services/translation.service";
import { SupportedLanguages } from "../../domain/models/translation.model";
import { SelectComponent } from "@shared/design-system/select/infrastructure/components/select.component";
import { SelectOption } from "@shared/design-system/select/domain/models/select-option.model";

@Component({
  selector: "app-language-selector",
  templateUrl: "./language-selector.component.html",
  imports: [FormsModule, SelectComponent],
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);

  readonly languages = [
    { code: SupportedLanguages.ES, label: "Español", flag: "🇪🇸" },
    { code: SupportedLanguages.EN, label: "English", flag: "🇬🇧" },
  ];

  readonly languageOptions: SelectOption[] = this.languages.map((language) => ({
    value: language.code,
    label: `${language.flag} ${language.label}`,
  }));

  readonly selectedLanguage = computed(() =>
    this.translationService.getCurrentLanguage(),
  );

  changeLanguage(language: string): void {
    this.translationService.setLanguage(language as SupportedLanguages);
  }
}
