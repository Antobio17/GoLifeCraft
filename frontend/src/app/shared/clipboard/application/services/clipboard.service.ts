import { DOCUMENT } from "@angular/common";
import { Injectable, inject } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ClipboardService {
  private readonly document = inject(DOCUMENT);
  private readonly window = inject(DOCUMENT).defaultView;

  async copy(text: string): Promise<boolean> {
    if (!this.isSupported()) return this.copyWithSelection(text);

    try {
      await this.window!.navigator.clipboard.writeText(text);
      return true;
    } catch {
      return this.copyWithSelection(text);
    }
  }

  private isSupported(): boolean {
    return typeof this.window?.navigator?.clipboard?.writeText === "function";
  }

  private copyWithSelection(text: string): boolean {
    const holder = this.document.createElement("textarea");

    holder.value = text;
    holder.setAttribute("readonly", "");
    holder.style.position = "fixed";
    holder.style.opacity = "0";
    holder.style.pointerEvents = "none";
    this.document.body.appendChild(holder);
    holder.select();

    try {
      return this.document.execCommand("copy");
    } catch {
      return false;
    } finally {
      holder.remove();
    }
  }
}
