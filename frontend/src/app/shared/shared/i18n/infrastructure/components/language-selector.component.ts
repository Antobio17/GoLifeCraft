import { Component, OnInit, inject } from "@angular/core";
import { TranslationService } from "../../application/services/translation.service";
import { SupportedLanguages } from "../../domain/models/translation.model";

@Component({
  selector: "app-language-selector",
  templateUrl: "./language-selector.component.html",
  styleUrls: ["./language-selector.component.css"],
})
export class LanguageSelectorComponent implements OnInit {
  private translationService = inject(TranslationService);

  readonly languages = [
    { code: SupportedLanguages.ES, label: "Español", flag: "🇪🇸" },
    { code: SupportedLanguages.EN, label: "English", flag: "🇬🇧" },
  ];

  selectedLanguage: SupportedLanguages = SupportedLanguages.ES;

  ngOnInit(): void {
    this.selectedLanguage = this.translationService.getCurrentLanguage();
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const language = target.value as SupportedLanguages;
    this.selectedLanguage = language;
    this.changeLanguage(language);
  }

  changeLanguage(language: SupportedLanguages): void {
    this.translationService.setLanguage(language);
    window.location.reload();
  }
}
