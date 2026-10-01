import { Component, NgZone, computed, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import {
  animationFrameScheduler,
  auditTime,
  filter,
  fromEvent,
  map,
} from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TabItemComponent } from "@shared/design-system/tab-item/infrastructure/components/tab-item.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SideDrawerService } from "@layouts/layout/side-drawer/application/services/side-drawer.service";
import { BottomNavItemsService } from "../../application/services/bottom-nav-items.service";
import { BottomNavActiveItemService } from "../../application/services/bottom-nav-active-item.service";
import { BottomNavCollapseService } from "../../application/services/bottom-nav-collapse.service";

@Component({
  selector: "app-bottom-nav",
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.css"],
  imports: [
    RouterLink,
    ContextualTranslatePipe,
    TabItemComponent,
    StackComponent,
  ],
  providers: [BottomNavCollapseService],
})
export class BottomNavComponent {
  private sideDrawerService = inject(SideDrawerService);
  private bottomNavItemsService = inject(BottomNavItemsService);
  private bottomNavActiveItemService = inject(BottomNavActiveItemService);
  private bottomNavCollapseService = inject(BottomNavCollapseService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private window = inject(DOCUMENT).defaultView;

  isDrawerOpen = this.sideDrawerService.isOpen;
  items = this.bottomNavItemsService.getItems();

  private url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  activeRoute = computed(() =>
    this.bottomNavActiveItemService.findActiveRoute(this.url(), this.items),
  );

  hidden = computed(
    () => this.bottomNavCollapseService.collapsed() && !this.isDrawerOpen(),
  );

  constructor() {
    this.zone.runOutsideAngular(() => this.watchScroll());

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.bottomNavCollapseService.expand());
  }

  toggleDrawer(): void {
    this.sideDrawerService.toggle();
  }

  private watchScroll(): void {
    const view = this.window;
    if (!view) return;

    fromEvent(view, "scroll", { passive: true })
      .pipe(auditTime(0, animationFrameScheduler), takeUntilDestroyed())
      .subscribe(() =>
        this.bottomNavCollapseService.track(
          view.scrollY,
          view.document.documentElement.scrollHeight - view.innerHeight,
        ),
      );
  }
}
