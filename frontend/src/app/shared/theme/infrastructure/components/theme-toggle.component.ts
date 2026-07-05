import { Component, inject } from "@angular/core";
import { ThemeService } from "../../application/services/theme.service";

@Component({
  selector: "app-theme-toggle",
  standalone: true,
  templateUrl: "./theme-toggle.component.html",
  styleUrls: ["./theme-toggle.component.css"],
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  isDark = this.themeService.isDark;

  toggle(): void {
    this.themeService.toggle();
  }
}
