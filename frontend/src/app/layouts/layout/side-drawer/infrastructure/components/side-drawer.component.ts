import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
} from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ScrollLockService } from "@shared/design-system/scroll-lock/application/services/scroll-lock.service";
import { ViewportService } from "@shared/viewport/application/services/viewport.service";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ThemeService } from "@shared/theme/application/services/theme.service";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { BrandLogoComponent } from "@shared/design-system/brand-logo/infrastructure/components/brand-logo.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { IconButtonComponent } from "@shared/design-system/icon-button/infrastructure/components/icon-button.component";
import { NavItemComponent } from "@shared/design-system/nav-item/infrastructure/components/nav-item.component";
import { AvatarComponent } from "@shared/design-system/avatar/infrastructure/components/avatar.component";
import { DividerComponent } from "@shared/design-system/divider/infrastructure/components/divider.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SideDrawerService } from "../../application/services/side-drawer.service";

@Component({
  selector: "app-side-drawer",
  imports: [
    RouterLink,
    RouterLinkActive,
    ContextualTranslatePipe,
    BrandLogoComponent,
    IconComponent,
    IconButtonComponent,
    NavItemComponent,
    AvatarComponent,
    DividerComponent,
    StackComponent,
  ],
  templateUrl: "./side-drawer.component.html",
  styleUrls: ["./side-drawer.component.css"],
})
export class SideDrawerComponent {
  private drawer = inject(SideDrawerService);
  private themeService = inject(ThemeService);
  private authSessionService = inject(AuthSessionService);
  private router = inject(Router);
  private viewport = inject(ViewportService);
  private scrollLock = inject(ScrollLockService);
  private destroyRef = inject(DestroyRef);

  private readonly isDocked = this.viewport.matches("(min-width: 768px)");

  readonly grafanaUrl = "/grafana/";

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
    this.destroyRef.onDestroy(() => this.scrollLock.release(this));

    effect(() => {
      const lockScroll = this.isOpen() && !this.isDocked();

      if (lockScroll) {
        this.scrollLock.lock(this);

        return;
      }

      this.scrollLock.release(this);
    });
  }

  close(): void {
    this.drawer.close();
  }

  toggleTheme(): void {
    this.themeService.toggle();
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
