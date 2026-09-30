import { Injectable, signal } from "@angular/core";

@Injectable()
export class BottomNavCollapseService {
  private readonly COLLAPSE_DISTANCE = 32;
  private readonly EXPAND_DISTANCE = 16;
  private readonly EDGE_ZONE = 64;

  private readonly state = signal(false);
  private anchor = 0;

  readonly collapsed = this.state.asReadonly();

  track(scrollY: number, maxScrollY: number): void {
    if (scrollY <= this.EDGE_ZONE || maxScrollY - scrollY <= this.EDGE_ZONE) {
      this.settle(scrollY, false);
      return;
    }

    const delta = scrollY - this.anchor;
    const movingWithState = this.collapsed() ? delta > 0 : delta < 0;

    if (movingWithState) {
      this.anchor = scrollY;
      return;
    }

    const distance = this.collapsed()
      ? this.EXPAND_DISTANCE
      : this.COLLAPSE_DISTANCE;

    if (Math.abs(delta) < distance) return;

    this.settle(scrollY, !this.collapsed());
  }

  expand(): void {
    this.state.set(false);
  }

  private settle(scrollY: number, collapsed: boolean): void {
    this.anchor = scrollY;
    this.state.set(collapsed);
  }
}
