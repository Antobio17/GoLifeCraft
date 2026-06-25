import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TranslationService } from "@shared/shared/i18n/application/services/translation.service";

export interface Breadcrumb {
  label: string;
  path?: string;
  action?: string;
}

@Component({
  selector: "app-breadcrumbs",
  templateUrl: "./breadcrumbs.component.html",
  styleUrls: ["./breadcrumbs.component.css"],
  imports: [ContextualTranslatePipe],
})
export class BreadcrumbsComponent {
  @Input() breadcrumbs: Breadcrumb[] = [];
  @Input() plain: boolean = false;
  @Output() navigate = new EventEmitter<string>();

  private translationService = inject(TranslationService);

  get translationsReady(): boolean {
    return this.translationService.isModuleLoaded("shared/shared/breadcrumbs");
  }

  onNavigate(action?: string): void {
    if (action) {
      this.navigate.emit(action);
    }
  }

  trackByBreadcrumb(index: number): string | number {
    const b = this.breadcrumbs?.[index];
    if (!b) {
      return index;
    }
    return b.path ?? b.action ?? b.label ?? index;
  }
}
