import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { filter } from "rxjs/operators";
import { NavbarComponent } from "@layouts/layout/navbar/infrastructure/components/navbar.component";
import {
  Breadcrumb,
  BreadcrumbsComponent,
} from "@shared/shared/breadcrumbs/infrastructure/components/breadcrumbs.component";
import { BreadcrumbService } from "@shared/shared/breadcrumbs/application/services/breadcrumb.service";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FloatingToastComponent } from "@shared/shared/floating-toasts/infrastructure/components/floating-toast.component";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";

@Component({
  selector: "app-main",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    BreadcrumbsComponent,
    FloatingToastComponent,
  ],
  styleUrls: ["./main.component.css"],
  templateUrl: "./main.component.html",
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authSessionService = inject(AuthSessionService);
  breadcrumbService = inject(BreadcrumbService);

  private routeBreadcrumbs = signal<Breadcrumb[]>([]);
  breadcrumbs = computed<Breadcrumb[]>(() => {
    const all = this.routeBreadcrumbs();
    const dynamicLabel = this.breadcrumbService.dynamicLastLabel();
    if (dynamicLabel && all.length > 0) {
      return [
        ...all.slice(0, -1),
        { ...all[all.length - 1], label: dynamicLabel },
      ];
    }
    return all;
  });

  username = computed(() => this.authSessionService.session()?.username ?? "");
  showNavbar =
    this.authSessionService.isAuthenticated() &&
    !this.router.url.startsWith("/login");

  ngOnInit(): void {
    this.buildBreadcrumbs();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.showNavbar = !this.router.url.startsWith("/login");
        this.buildBreadcrumbs();
      });
  }

  private buildBreadcrumbs(): void {
    this.breadcrumbService.clearDynamicLastLabel();
    const breadcrumbs: Breadcrumb[] = [];

    let route = this.route.root;
    let url = "";

    while (route.firstChild) {
      route = route.firstChild;
      const snapshot = route.snapshot;

      if (!snapshot) continue;

      const routeConfig = snapshot.routeConfig;
      const path = snapshot.url.map((s) => s.path).join("/");
      if (path) {
        url += `/${path}`;
      }

      const data = routeConfig?.data;
      const hasBreadcrumbKey = data != null && "breadcrumb" in data;
      const label = hasBreadcrumbKey
        ? (data["breadcrumb"] as string | null | undefined)
        : path || undefined;

      if (label) {
        breadcrumbs.push({ label, action: url || "/" });
      }
    }

    this.routeBreadcrumbs.set(breadcrumbs);
  }

  handleBreadcrumbNavigation(action?: string): void {
    if (!action) return;

    if (action === "dashboard") {
      this.router.navigate(["/me"]);
      return;
    }

    this.router.navigateByUrl(action);
  }

  onLogout(): void {
    this.authSessionService.clearSession();
    this.router.navigate(["/login"]);
  }
}
