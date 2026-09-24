import { DOCUMENT } from "@angular/common";
import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import {
  Subject,
  delay,
  filter,
  fromEvent,
  map,
  merge,
  scan,
  startWith,
} from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TabItemComponent } from "@shared/design-system/tab-item/infrastructure/components/tab-item.component";
import { ScrollRowComponent } from "@shared/design-system/scroll-row/infrastructure/components/scroll-row.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SideDrawerService } from "@layouts/layout/side-drawer/application/services/side-drawer.service";
import { BottomNavItemsService } from "../../application/services/bottom-nav-items.service";
import { BottomNavActiveItemService } from "../../application/services/bottom-nav-active-item.service";
import { BottomNavMinimizeService } from "../../application/services/bottom-nav-minimize.service";
import { BottomNavScrollSample } from "../../domain/models/bottom-nav-scroll-sample.model";
import { BottomNavScrollState } from "../../domain/models/bottom-nav-scroll-state.model";

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
})
export class BottomNavComponent {
  private sideDrawerService = inject(SideDrawerService);
  private bottomNavItemsService = inject(BottomNavItemsService);
  private bottomNavActiveItemService = inject(BottomNavActiveItemService);
  private bottomNavMinimizeService = inject(BottomNavMinimizeService);
  private router = inject(Router);
  private document = inject(DOCUMENT);

  holdExpanded = input(false);

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

  private expandRequests = new Subject<void>();

  private scrollState = toSignal(
    merge(
      fromEvent(this.document, "scroll", { passive: true }).pipe(
        map(() => this.scrollSample()),
        map(
          (sample) => (state: BottomNavScrollState) =>
            this.bottomNavMinimizeService.next(state, sample),
        ),
      ),
      merge(
        this.expandRequests,
        this.router.events.pipe(
          filter((event) => event instanceof NavigationEnd),
        ),
      ).pipe(
        map(
          () => (state: BottomNavScrollState) =>
            this.bottomNavMinimizeService.expand(state),
        ),
      ),
    ).pipe(
      scan(
        (state, reduce) => reduce(state),
        this.bottomNavMinimizeService.initial(),
      ),
    ),
    { initialValue: this.bottomNavMinimizeService.initial() },
  );

  minimized = computed(
    () =>
      this.scrollState().minimized &&
      !this.isDrawerOpen() &&
      !this.holdExpanded(),
  );

  activeRoute = computed(() =>
    this.bottomNavActiveItemService.findActiveRoute(this.url(), this.items),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        delay(0),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.scrollActiveIntoView());
  }

  toggleDrawer(): void {
    this.sideDrawerService.toggle();
  }

  expand(): void {
    this.expandRequests.next();
  }

  private scrollSample(): BottomNavScrollSample {
    const root = this.document.documentElement;

    return {
      y: this.document.defaultView?.scrollY ?? 0,
      maxY: root.scrollHeight - root.clientHeight,
    };
  }

  scrollActiveIntoView(): void {
    const active = this.track?.nativeElement.querySelector(".is-active");
    if (!active) return;

    active.scrollIntoView({ block: "nearest", inline: "center" });
  }
}
