import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TabItemComponent } from "@shared/design-system/tab-item/infrastructure/components/tab-item.component";
import { SideDrawerService } from "@layouts/layout/side-drawer/application/services/side-drawer.service";

@Component({
  selector: "app-bottom-nav",
  standalone: true,
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.css"],
  imports: [
    RouterLink,
    RouterLinkActive,
    ContextualTranslatePipe,
    TabItemComponent,
  ],
})
export class BottomNavComponent {
  private sideDrawerService = inject(SideDrawerService);

  isDrawerOpen = this.sideDrawerService.isOpen;

  toggleDrawer(): void {
    this.sideDrawerService.toggle();
  }
}
