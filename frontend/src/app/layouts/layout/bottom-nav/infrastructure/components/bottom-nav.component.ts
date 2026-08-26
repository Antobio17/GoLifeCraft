import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { delay, filter, map, startWith } from "rxjs";
import { ContextualTranslatePipe } from "@shared/i18n/infrastructure/pipes/contextual-translate.pipe";
import { TabItemComponent } from "@shared/design-system/tab-item/infrastructure/components/tab-item.component";
import { ScrollRowComponent } from "@shared/design-system/scroll-row/infrastructure/components/scroll-row.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SideDrawerService } from "@layouts/layout/side-drawer/application/services/side-drawer.service";
import { BottomNavItemsService } from "../../application/services/bottom-nav-items.service";
import { BottomNavActiveItemService } from "../../application/services/bottom-nav-active-item.service";

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
  private router = inject(Router);

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

  scrollActiveIntoView(): void {
    const active = this.track?.nativeElement.querySelector(".is-active");
    if (!active) return;

    active.scrollIntoView({ block: "nearest", inline: "center" });
  }
}
