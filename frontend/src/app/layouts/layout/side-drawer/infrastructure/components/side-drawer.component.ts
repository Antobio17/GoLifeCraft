import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ThemeService } from "@shared/theme/application/services/theme.service";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BrandLogoComponent } from "@shared/design-system/brand-logo/infrastructure/components/brand-logo.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { NavItemComponent } from "@shared/design-system/nav-item/infrastructure/components/nav-item.component";
import { AvatarComponent } from "@shared/design-system/avatar/infrastructure/components/avatar.component";
import { SideDrawerService } from "../../application/services/side-drawer.service";

@Component({
  selector: "app-side-drawer",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    ContextualTranslatePipe,
    BrandLogoComponent,
    IconComponent,
    IconButtonComponent,
    NavItemComponent,
    AvatarComponent,
  ],
  templateUrl: "./side-drawer.component.html",
  styleUrls: ["./side-drawer.component.css"],
})
export class SideDrawerComponent {
  private drawer = inject(SideDrawerService);
  private themeService = inject(ThemeService);
  private authSessionService = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  private readonly dockedQuery = window.matchMedia("(min-width: 768px)");
  private readonly isDocked = signal(this.dockedQuery.matches);

  readonly isOpen = this.drawer.isOpen;
  readonly isDark = this.themeService.isDark;
  readonly isGod = computed(() => this.authSessionService.isGod());

  readonly isInteractive = computed(() => this.isOpen() || this.isDocked());

  readonly email = computed(() => this.authSessionService.getUsername());

  readonly displayName = computed(() => {
    const name = this.authSessionService.getName();
    if (name) return name;

    const local = this.email().trim().split("@")[0];
    if (!local) return "";
    return local.charAt(0).toUpperCase() + local.slice(1);
  });

  readonly initial = computed(() => {
    const value = this.displayName().trim();
    return value ? value.charAt(0).toUpperCase() : "?";
  });

  constructor() {
    this.dockedQuery.addEventListener("change", (event) =>
      this.isDocked.set(event.matches),
    );

    effect(() => {
      const lockScroll = this.isOpen() && !this.isDocked();
      document.body.style.overflow = lockScroll ? "hidden" : "";
    });
  }

  close(): void {
    this.drawer.close();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  comingSoon(): void {
    this.close();
    this.floatingToastService.showToast({
      status: 200,
      keyTranslation: "navbar.comingSoon",
      details: [],
    });
  }

  logout(): void {
    this.close();
    this.authSessionService.clearSession();
    this.router.navigate(["/login"]);
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (!this.isOpen()) return;
    this.close();
  }
}
