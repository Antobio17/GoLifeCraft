import { Injectable } from "@angular/core";
import { BottomNavScrollSample } from "../../domain/models/bottom-nav-scroll-sample.model";
import { BottomNavScrollState } from "../../domain/models/bottom-nav-scroll-state.model";

@Injectable({ providedIn: "root" })
export class BottomNavMinimizeService {
  private static readonly TOP_ZONE = 64;
  private static readonly TRAVEL_THRESHOLD = 24;

  initial(): BottomNavScrollState {
    return { minimized: false, lastY: 0, travel: 0 };
  }

  next(
    state: BottomNavScrollState,
    sample: BottomNavScrollSample,
  ): BottomNavScrollState {
    const y = Math.min(Math.max(sample.y, 0), Math.max(sample.maxY, 0));

    if (y <= BottomNavMinimizeService.TOP_ZONE) {
      return { minimized: false, lastY: y, travel: 0 };
    }

    const delta = y - state.lastY;
    const travel =
      Math.sign(delta) === Math.sign(state.travel)
        ? state.travel + delta
        : delta;

    if (travel > BottomNavMinimizeService.TRAVEL_THRESHOLD) {
      return { minimized: true, lastY: y, travel };
    }

    if (travel < -BottomNavMinimizeService.TRAVEL_THRESHOLD) {
      return { minimized: false, lastY: y, travel };
    }

    return { minimized: state.minimized, lastY: y, travel };
  }

  expand(state: BottomNavScrollState): BottomNavScrollState {
    return { ...state, minimized: false, travel: 0 };
  }
}
