import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { SideDrawerService } from "@layouts/layout/side-drawer/application/services/side-drawer.service";

@Component({
  selector: "app-bottom-nav",
  standalone: true,
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.css"],
  imports: [RouterLink, RouterLinkActive, ContextualTranslatePipe],
})
export class BottomNavComponent {
  private floatingToastService = inject(FloatingToastService);
  private sideDrawerService = inject(SideDrawerService);

  isDrawerOpen = this.sideDrawerService.isOpen;

  toggleDrawer(): void {
    this.sideDrawerService.toggle();
  }

  comingSoon(): void {
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "navbar.comingSoon",
      details: [],
    });
  }
}
