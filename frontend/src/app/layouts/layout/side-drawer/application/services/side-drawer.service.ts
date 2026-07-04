import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class SideDrawerService {
  private readonly _open = signal(false);
  readonly isOpen = this._open.asReadonly();

  open(): void {
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
  }

  toggle(): void {
    this._open.update((value) => !value);
  }
}
