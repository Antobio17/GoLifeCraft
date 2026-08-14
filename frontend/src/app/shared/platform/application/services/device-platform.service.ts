import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class DevicePlatformService {
  private readonly window = inject(DOCUMENT).defaultView;

  isIos(): boolean {
    const navigator = this.window?.navigator;

    if (!navigator) return false;

    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;

    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }
}
