import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { Subscription, filter } from "rxjs";
import { ContextualTranslatePipe } from "../../../../../shared/shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { ThemeToggleComponent } from "../../../../../shared/shared/theme/infrastructure/components/theme-toggle.component";
import { ThemeService } from "../../../../../shared/shared/theme/application/services/theme.service";
import { TranslationService } from "../../../../../shared/shared/i18n/application/services/translation.service";
import { AuthSessionService } from "../../../../../shared/auth/application/services/auth-session.service";

type MenuId = "authorization" | "reports";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    ContextualTranslatePipe,
    ThemeToggleComponent,
  ],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  username = input<string>("");
  logoutClick = output<void>();

  openMenu = signal<MenuId | null>(null);
  currentSection = signal<MenuId | null>(null);
  mobileMenuOpen = signal(false);

  private elementRef = inject(ElementRef);
  private translationService = inject(TranslationService);
  private authSessionService = inject(AuthSessionService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private routerSub?: Subscription;

  isDark = this.themeService.isDark;

  initials = computed(() => {
    const name = (this.username() || "").trim();
    if (!name) return "GL";
    const parts = name.split(/[\s.@_-]+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second =
      parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "");
    return (first + second).toUpperCase();
  });

  get translationsReady(): boolean {
    return this.translationService.isModuleLoaded(
      "layouts/layout/navbar/navbar",
    );
  }

  canAccessAuthorization(): boolean {
    return this.authSessionService.isGod();
  }

  canAccessReports(): boolean {
    const role = this.authSessionService.getCurrentUserRole();
    return ["ROLE_GOD"].includes(role);
  }

  ngOnInit(): void {
    this.updateCurrentSection(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateCurrentSection((event as NavigationEnd).urlAfterRedirects);
        this.closeAll();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateCurrentSection(url: string): void {
    const path = url.split("?")[0];
    if (path.startsWith("/users")) {
      this.currentSection.set("authorization");
      return;
    }
    if (path.startsWith("/reports")) {
      this.currentSection.set("reports");
      return;
    }
    this.currentSection.set(null);
  }

  toggleMenu(menu: MenuId, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openMenu.set(this.openMenu() === menu ? null : menu);
  }

  closeAll(): void {
    this.openMenu.set(null);
    this.mobileMenuOpen.set(false);
  }

  closeMenus(): void {
    this.openMenu.set(null);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
    if (!this.mobileMenuOpen()) this.openMenu.set(null);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.openMenu.set(null);
  }

  onLogout(): void {
    this.closeMobileMenu();
    this.logoutClick.emit();
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.closeAll();
  }

  @HostListener("document:click", ["$event.target"])
  onDocumentClick(target: EventTarget | null): void {
    if (!(target instanceof HTMLElement)) {
      this.closeMenus();
      return;
    }
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }
}
