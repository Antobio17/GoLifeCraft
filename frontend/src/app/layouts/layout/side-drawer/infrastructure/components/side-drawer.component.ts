import {
  Component,
  HostListener,
  computed,
  effect,
  inject,
} from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ThemeService } from "@shared/shared/theme/application/services/theme.service";
import { FloatingToastService } from "@shared/shared/floating-toasts/application/services/floating-toast.service";
import { ContextualTranslatePipe } from "@shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { SideDrawerService } from "../../application/services/side-drawer.service";

@Component({
  selector: "app-side-drawer",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ContextualTranslatePipe],
  templateUrl: "./side-drawer.component.html",
  styleUrls: ["./side-drawer.component.css"],
})
export class SideDrawerComponent {
  private drawer = inject(SideDrawerService);
  private themeService = inject(ThemeService);
  private authSessionService = inject(AuthSessionService);
  private floatingToastService = inject(FloatingToastService);
  private router = inject(Router);

  readonly isOpen = this.drawer.isOpen;
  readonly isDark = this.themeService.isDark;
  readonly isGod = computed(() => this.authSessionService.isGod());

  readonly email = computed(() => this.authSessionService.getUsername());

  readonly displayName = computed(() => {
    const local = this.email().trim().split("@")[0];
    if (!local) return "";
    return local.charAt(0).toUpperCase() + local.slice(1);
  });

  readonly initial = computed(() => {
    const value = this.email().trim();
    return value ? value.charAt(0).toUpperCase() : "?";
  });

  constructor() {
    effect(() => {
      document.body.style.overflow = this.isOpen() ? "hidden" : "";
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
