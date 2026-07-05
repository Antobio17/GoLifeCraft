import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";

@Component({
  selector: "app-bottom-nav",
  standalone: true,
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.css"],
  imports: [RouterLink, RouterLinkActive, ContextualTranslatePipe],
})
export class BottomNavComponent {
  private floatingToastService = inject(FloatingToastService);

  comingSoon(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "navbar.comingSoon",
      details: [],
    });
  }
}
