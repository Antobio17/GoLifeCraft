import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import {
  animationFrameScheduler,
  auditTime,
  delay,
  filter,
  fromEvent,
  map,
  startWith,
} from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TabItemComponent } from "@shared/design-system/tab-item/infrastructure/components/tab-item.component";
import { ScrollRowComponent } from "@shared/design-system/scroll-row/infrastructure/components/scroll-row.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SideDrawerService } from "@layouts/layout/side-drawer/application/services/side-drawer.service";
import { BottomNavItemsService } from "../../application/services/bottom-nav-items.service";
import { BottomNavActiveItemService } from "../../application/services/bottom-nav-active-item.service";
import { BottomNavCollapseService } from "../../application/services/bottom-nav-collapse.service";
import { ActiveWorkoutService } from "@gym/training/workout/application/services/active-workout.service";

@Component({
  selector: "app-bottom-nav",
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.css"],
  imports: [
    RouterLink,
    ContextualTranslatePipe,
    TabItemComponent,
    ScrollRowComponent,
    StackComponent,
  ],
  providers: [BottomNavCollapseService],
})
export class BottomNavComponent {
  private sideDrawerService = inject(SideDrawerService);
  private bottomNavItemsService = inject(BottomNavItemsService);
  private bottomNavActiveItemService = inject(BottomNavActiveItemService);
  private bottomNavCollapseService = inject(BottomNavCollapseService);
  private activeWorkout = inject(ActiveWorkoutService);
  private router = inject(Router);
  private window = inject(DOCUMENT).defaultView;

  @ViewChild("track", { read: ElementRef })
  private track?: ElementRef<HTMLElement>;

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

  compact = computed(
    () => this.bottomNavCollapseService.collapsed() && !this.isDrawerOpen(),
  );

  liveRoute = computed(() => (this.activeWorkout.isActive() ? "/gym" : ""));

  constructor() {
    this.watchScroll();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        delay(0),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.bottomNavCollapseService.expand();
        this.scrollActiveIntoView();
      });
  }

  toggleDrawer(): void {
    this.sideDrawerService.toggle();
  }

  scrollActiveIntoView(): void {
    const active = this.track?.nativeElement.querySelector(".is-active");
    if (!active) return;

    active.scrollIntoView({ block: "nearest", inline: "center" });
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
