import { Component, inject } from "@angular/core";
import { ThemeService } from "../../application/services/theme.service";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";

@Component({
  selector: "app-theme-toggle",
  standalone: true,
  templateUrl: "./theme-toggle.component.html",
  imports: [IconButtonComponent],
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  isDark = this.themeService.isDark;

  toggle(): void {
    this.themeService.toggle();
  }
}
