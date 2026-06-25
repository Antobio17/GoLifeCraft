import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from "@angular/core";

@Component({
  selector: "app-bottom-drawer",
  templateUrl: "./bottom-drawer.component.html",
  styleUrls: ["./bottom-drawer.component.css"],
  imports: [],
})
export class BottomDrawerComponent implements OnChanges {
  @Input() open: boolean = false;
  @Input() title?: string;
  @Input() maxHeight: string = "80vh";
  @Input() snapToContent: boolean = false;
  @Output() closed = new EventEmitter<void>();

  private elementRef = inject(ElementRef);
  private previouslyFocused: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["open"]) {
      if (this.open) {
        document.body.classList.add("drawer-lock");
        this.previouslyFocused = document.activeElement as HTMLElement;
        setTimeout(() => this.focusFirstFocusable(), 50);
      } else {
        document.body.classList.remove("drawer-lock");
        this.previouslyFocused?.focus();
        this.previouslyFocused = null;
      }
    }
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.open) {
      this.close();
    }
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.open || event.key !== "Tab") {
      return;
    }

    const focusable = this.getFocusableElements();

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close(): void {
    this.closed.emit();
  }

  private focusFirstFocusable(): void {
    const focusable = this.getFocusableElements();
    focusable[0]?.focus();
  }

  private getFocusableElements(): HTMLElement[] {
    const selectors =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(
      this.elementRef.nativeElement.querySelectorAll(selectors),
    );
  }
}
