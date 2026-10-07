import { DOCUMENT } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
  afterNextRender,
  inject,
  signal,
} from "@angular/core";
import { Subscription, fromEvent, merge, timer } from "rxjs";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { PresentedSheetsService } from "@shared/design-system/modal-sheet/application/services/presented-sheets.service";
import { ViewportService } from "@shared/viewport/application/services/viewport.service";
import { ScrollLockService } from "@shared/design-system/scroll-lock/application/services/scroll-lock.service";
import { StatusBarTintService } from "@shared/design-system/status-bar-tint/application/services/status-bar-tint.service";

@Component({
  selector: "ds-modal-sheet",
  imports: [IconComponent],
  template: `
    @if (rendered()) {
      <div
        #overlay
        class="ds-sheet__overlay"
        [class.ds-sheet__overlay--closing]="closing()"
        tabindex="-1"
        (click)="closed.emit()"
        (keydown.escape)="closed.emit()"
      >
        <div
          #sheet
          class="ds-sheet"
          [class.ds-sheet--tall]="tall"
          [class.ds-sheet--bare]="bare"
          [class.ds-sheet--closing]="closing()"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="bare ? title : null"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
        >
          @if (bare) {
            <div class="ds-sheet__grab" aria-hidden="true">
              <div class="ds-sheet__grip"></div>
            </div>
          }
          <div class="ds-sheet__body">
            @if (!bare) {
              <header class="ds-sheet__header ds-sheet__grab">
                <div class="ds-sheet__grip" aria-hidden="true"></div>
                <div class="ds-sheet__bar">
                  <button
                    class="ds-sheet__action ds-sheet__close"
                    type="button"
                    [attr.aria-label]="closeLabel"
                    (click)="closed.emit()"
                  >
                    <ds-icon name="close" [size]="18" [stroke]="2.3" />
                  </button>
                  <h2 class="ds-sheet__title">{{ title }}</h2>
                  @if (confirmLabel) {
                    <button
                      class="ds-sheet__action ds-sheet__confirm"
                      data-testid="sheet-confirm"
                      type="button"
                      [class.ds-sheet__confirm--danger]="
                        confirmTone === 'danger'
                      "
                      [class.ds-sheet__confirm--armed]="armed()"
                      [disabled]="confirmDisabled"
                      [attr.aria-label]="
                        armed() ? confirmArmedLabel : confirmLabel
                      "
                      (click)="onConfirm()"
                    >
                      <ds-icon
                        [name]="confirmIcon"
                        [size]="18"
                        [stroke]="2.3"
                      />
                    </button>
                  } @else {
                    <span class="ds-sheet__spacer"></span>
                  }
                </div>
              </header>
            }
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .ds-sheet__overlay {
        --ds-sheet-viewport: calc(100dvh - env(safe-area-inset-top));
        --ds-sheet-gap: var(--ds-space-2);
        --ds-sheet-radius: calc(var(--ds-device-radius) - var(--ds-sheet-gap));
        --ds-sheet-max: min(calc(var(--ds-sheet-viewport) * 0.78), 50rem);
        --ds-sheet-close: calc(var(--ds-dur-4) * 1.6);

        position: fixed;
        inset: 0 0 0 var(--ds-app-inset-left, 0px);
        z-index: 1000;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0 var(--ds-sheet-gap) var(--ds-sheet-gap);
      }
      .ds-sheet__overlay::before {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(0.125rem);
        -webkit-backdrop-filter: blur(0.125rem);
        opacity: var(--ds-sheet-scrim, 1);
        transition: opacity var(--ds-dur-3) var(--ds-ease-out);
        animation: ds-sheet-fade var(--ds-dur-3) var(--ds-ease-out);
      }
      .ds-sheet__overlay[data-dragging]::before {
        transition: none;
      }
      .ds-sheet__overlay--closing::before {
        opacity: 0;
        transition: opacity var(--ds-sheet-close) var(--ds-ease-in-out);
      }
      .ds-sheet {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 30rem;
        max-height: var(--ds-sheet-max);
        --ds-surface: var(--ds-sheet-surface);
        --ds-surface-raised: var(--ds-sheet-surface-raised);
        --ds-surface-subtle: var(--ds-sheet-surface-subtle);
        --ds-surface-inset: var(--ds-sheet-surface-inset);
        --ds-surface-hover: var(--ds-sheet-surface-hover);
        --ds-glass-bg: var(--ds-sheet-header-bg);
        background: var(--ds-sheet-bg);
        border: 1px solid var(--ds-sheet-border);
        border-radius: var(--ds-sheet-radius);
        box-shadow: var(--ds-sheet-shadow);
        backdrop-filter: var(--ds-sheet-backdrop);
        -webkit-backdrop-filter: var(--ds-sheet-backdrop);
        overflow: hidden;
        will-change: transform;
        animation: ds-sheet-up var(--ds-dur-4) var(--ds-ease-spring);
      }
      .ds-sheet--tall {
        height: var(--ds-sheet-max);
      }
      .ds-sheet--closing {
        transform: translate3d(0, calc(100% + var(--ds-sheet-gap) * 2), 0);
        transition: transform var(--ds-sheet-close) var(--ds-ease-in-out);
        pointer-events: none;
      }
      .ds-sheet__grab {
        flex: none;
        touch-action: none;
        cursor: grab;
      }
      .ds-sheet__grab:active {
        cursor: grabbing;
      }
      .ds-sheet__grip {
        width: 2.25rem;
        height: 0.3125rem;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-border-strong);
        margin: var(--ds-space-2) auto 0;
      }
      .ds-sheet__header {
        position: sticky;
        top: 0;
        z-index: 2;
        margin: 0 calc(var(--ds-space-4) * -1);
      }
      .ds-sheet__header::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        background: var(--ds-glass-bg);
        box-shadow: 0 1px 0 var(--ds-border);
        backdrop-filter: var(--ds-glass-blur);
        -webkit-backdrop-filter: var(--ds-glass-blur);
        opacity: 0;
        animation: ds-sheet-header-glass linear both;
        animation-timeline: scroll(nearest);
        animation-range: 0 var(--ds-space-4);
      }
      .ds-sheet__bar {
        display: grid;
        grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
        align-items: center;
        gap: var(--ds-space-2);
        padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-3);
      }
      .ds-sheet__title {
        margin: 0;
        text-align: center;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-sheet__action {
        appearance: none;
        cursor: pointer;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        border: 1px solid var(--ds-border);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-glass-bg);
        color: var(--ds-text);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
        transition:
          transform var(--ds-dur-1) var(--ds-ease-out),
          background-color var(--ds-dur-3) var(--ds-ease-in-out),
          color var(--ds-dur-3) var(--ds-ease-in-out);
      }
      .ds-sheet__action:active:not(:disabled) {
        transform: scale(0.9);
      }
      .ds-sheet__action:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
      .ds-sheet__confirm {
        background: var(--ds-primary);
        border-color: transparent;
        color: var(--ds-on-primary);
      }
      .ds-sheet__confirm--danger {
        background: var(--ds-danger-soft);
        border-color: var(--ds-danger-soft-border);
        color: var(--ds-danger-soft-text);
      }
      .ds-sheet__confirm--armed {
        background: var(--ds-danger);
        border-color: transparent;
        color: #fff;
        box-shadow: 0 0 0 0.25rem var(--ds-danger-soft);
        animation: ds-sheet-armed var(--ds-dur-3) var(--ds-ease-spring);
      }
      .ds-sheet__confirm:disabled {
        background: var(--ds-surface-hover);
        color: var(--ds-text-meta);
        cursor: default;
      }
      .ds-sheet__body {
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        padding: 0 var(--ds-space-4)
          max(
            calc(env(safe-area-inset-bottom) - var(--ds-sheet-gap)),
            var(--ds-space-5)
          );
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
      }
      .ds-sheet--bare .ds-sheet__body {
        display: flex;
        flex-direction: column;
        padding: 0 0
          max(
            calc(env(safe-area-inset-bottom) - var(--ds-sheet-gap)),
            var(--ds-space-3)
          );
        overflow: hidden;
      }
      .ds-sheet--bare .ds-sheet__grab {
        padding-bottom: var(--ds-space-1);
      }
      @keyframes ds-sheet-up {
        from {
          transform: translate3d(0, calc(100% + var(--ds-sheet-gap) * 2), 0);
        }
      }
      @keyframes ds-sheet-armed {
        50% {
          transform: scale(1.12);
        }
      }
      @keyframes ds-sheet-fade {
        from {
          opacity: 0;
        }
      }
      @keyframes ds-sheet-header-glass {
        to {
          opacity: 1;
        }
      }
      @media (min-width: 640px) {
        .ds-sheet__overlay {
          align-items: center;
          padding: var(--ds-space-5);
        }
        .ds-sheet__grip {
          visibility: hidden;
        }
        .ds-sheet__grab {
          cursor: default;
          touch-action: auto;
        }
        .ds-sheet {
          border-radius: var(--ds-radius-surface);
          animation-name: ds-sheet-pop;
          animation-timing-function: var(--ds-ease-out);
        }
        .ds-sheet--closing {
          opacity: 0;
          transform: scale(0.96);
          transition:
            transform var(--ds-dur-3) var(--ds-ease-in),
            opacity var(--ds-dur-3) var(--ds-ease-in);
        }
      }
      @keyframes ds-sheet-pop {
        from {
          opacity: 0;
          transform: scale(0.94) translateY(0.75rem);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-sheet,
        .ds-sheet__confirm--armed,
        .ds-sheet__overlay::before {
          animation: none;
        }
        .ds-sheet--closing,
        .ds-sheet__overlay--closing::before {
          transition-duration: 1ms;
        }
      }
    `,
  ],
})
export class ModalSheetComponent implements OnDestroy {
  private static readonly DISMISS_RATIO = 0.3;
  private static readonly DISMISS_VELOCITY = 0.4;
  private static readonly FLING_MIN_OFFSET = 16;
  private static readonly VELOCITY_WINDOW_MS = 100;
  private static readonly CLOSE_FALLBACK_MS = 900;
  private static readonly ARMED_MS = 3000;

  private renderer = inject(Renderer2);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  private zone = inject(NgZone);
  private injector = inject(Injector);
  private scrollLock = inject(ScrollLockService);
  private statusBarTint = inject(StatusBarTintService);
  private presentedSheets = inject(PresentedSheetsService);
  private dialogLayout = inject(ViewportService).matches("(min-width: 640px)");

  private isOpen = false;
  private overlayNode: HTMLElement | null = null;
  private sheetNode: HTMLElement | null = null;
  private gestures: Subscription | null = null;
  private closeWatch: Subscription | null = null;
  private armedWatch: Subscription | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private tallestSeen = 0;

  readonly rendered = signal(false);
  readonly closing = signal(false);
  readonly armed = signal(false);

  @ViewChild("overlay")
  set overlay(reference: ElementRef<HTMLElement> | undefined) {
    this.detachOverlay();

    if (!reference) {
      return;
    }

    this.overlayNode = reference.nativeElement;
    this.inheritModule(this.overlayNode);
    this.renderer.appendChild(this.document.body, this.overlayNode);
  }

  @ViewChild("sheet")
  set sheet(reference: ElementRef<HTMLElement> | undefined) {
    this.detachGestures();

    if (!reference) {
      return;
    }

    this.sheetNode = reference.nativeElement;
    this.zone.runOutsideAngular(() => this.attachGestures());
  }

  @Input()
  set open(value: boolean) {
    if (value === this.isOpen) {
      return;
    }

    this.isOpen = value;

    if (value) {
      this.show();
      return;
    }

    this.hide();
  }

  get open(): boolean {
    return this.isOpen;
  }

  @Input() tall = false;
  @Input() bare = false;
  @Input() title = "";
  @Input() closeLabel = "Close";
  @Input() confirmLabel = "";
  @Input() confirmDisabled = false;
  @Input() confirmIcon: DsIconName = "save";
  @Input() confirmTone: "primary" | "danger" = "primary";
  @Input() confirmTwice = false;
  @Input() confirmArmedLabel = "";
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  ngOnDestroy(): void {
    this.disarm();
    this.closeWatch?.unsubscribe();
    this.toggleOverlayEffects(false);
    this.detachGestures();
    this.detachOverlay();
  }

  onConfirm(): void {
    if (!this.confirmTwice || this.armed()) {
      this.disarm();
      this.confirmed.emit();
      return;
    }

    this.armed.set(true);
    this.armedWatch = timer(ModalSheetComponent.ARMED_MS).subscribe(() =>
      this.disarm(),
    );
  }

  private disarm(): void {
    this.armedWatch?.unsubscribe();
    this.armedWatch = null;
    this.armed.set(false);
  }

  private show(): void {
    this.closeWatch?.unsubscribe();
    this.disarm();
    this.closing.set(false);
    this.rendered.set(true);
    this.toggleOverlayEffects(true);
  }

  private hide(): void {
    if (!this.rendered()) {
      return;
    }

    this.sheetNode?.style.removeProperty("transition");
    this.sheetNode?.style.removeProperty("transform");
    this.closing.set(true);

    const fallback = timer(ModalSheetComponent.CLOSE_FALLBACK_MS);
    const finished = this.sheetNode
      ? merge(
          fromEvent<TransitionEvent>(this.sheetNode, "transitionend"),
          fallback,
        )
      : fallback;

    this.closeWatch = finished.subscribe((event) => {
      if (event instanceof TransitionEvent && event.target !== this.sheetNode) {
        return;
      }

      this.finishClose();
    });
  }

  private finishClose(): void {
    this.closeWatch?.unsubscribe();
    this.closeWatch = null;
    this.closing.set(false);
    this.rendered.set(false);
    this.toggleOverlayEffects(false);
  }

  private attachGestures(): void {
    const sheet = this.sheetNode;
    const grab = sheet?.querySelector<HTMLElement>(".ds-sheet__grab");
    if (!sheet || !grab) {
      return;
    }

    this.tallestSeen = 0;
    this.resizeObserver = new ResizeObserver(() => this.holdHeight(sheet));
    this.resizeObserver.observe(sheet);

    let startY = 0;
    let lastY = 0;
    let height = 0;
    let dragging = false;
    let touchStart: { x: number; y: number } | null = null;
    let samples: { y: number; time: number }[] = [];

    const canDrag = () => !this.dialogLayout() && !this.closing();

    const begin = (y: number) => {
      dragging = true;
      startY = lastY = y;
      samples = [{ y, time: performance.now() }];
      height = sheet.offsetHeight;
      sheet.style.transition = "none";
      this.overlayNode?.setAttribute("data-dragging", "");
    };

    const follow = (y: number) => {
      const now = performance.now();
      lastY = y;
      samples = [...samples, { y, time: now }].filter(
        (sample) => now - sample.time <= ModalSheetComponent.VELOCITY_WINDOW_MS,
      );

      const offset = this.resist(y - startY);
      sheet.style.transform = `translate3d(0, ${offset}px, 0)`;
      this.overlayNode?.style.setProperty(
        "--ds-sheet-scrim",
        String(1 - Math.max(0, offset) / height),
      );
    };

    const release = () => {
      dragging = false;
      this.overlayNode?.removeAttribute("data-dragging");

      const offset = lastY - startY;
      const oldest = samples[0];
      const elapsed = performance.now() - (oldest?.time ?? 0);
      const velocity = oldest ? (lastY - oldest.y) / Math.max(1, elapsed) : 0;
      const flung =
        velocity > ModalSheetComponent.DISMISS_VELOCITY &&
        offset > ModalSheetComponent.FLING_MIN_OFFSET;
      const pulled = offset > height * ModalSheetComponent.DISMISS_RATIO;

      if (!flung && !pulled) {
        this.settle(sheet);
        return;
      }

      this.zone.run(() => this.closed.emit());
      afterNextRender(
        () => {
          if (this.closing()) {
            return;
          }

          this.settle(sheet);
        },
        { injector: this.injector },
      );
    };

    this.gestures = new Subscription();

    this.gestures.add(
      fromEvent<PointerEvent>(grab, "pointerdown").subscribe((event) => {
        if (!canDrag() || (event.target as Element).closest("button")) {
          return;
        }

        grab.setPointerCapture(event.pointerId);
        begin(event.clientY);
      }),
    );

    this.gestures.add(
      fromEvent<PointerEvent>(grab, "pointermove").subscribe((event) => {
        if (!dragging) {
          return;
        }

        follow(event.clientY);
      }),
    );

    this.gestures.add(
      merge(
        fromEvent<PointerEvent>(grab, "pointerup"),
        fromEvent<PointerEvent>(grab, "pointercancel"),
      ).subscribe(() => {
        if (!dragging) {
          return;
        }

        release();
      }),
    );

    this.gestures.add(
      fromEvent<TouchEvent>(sheet, "touchstart", { passive: true }).subscribe(
        (event) => {
          touchStart = null;
          const touch = event.touches[0];
          if (event.touches.length !== 1 || !touch || !canDrag()) {
            return;
          }

          if (!this.claimsContentDrag(sheet, event.target as Element)) {
            return;
          }

          touchStart = { x: touch.clientX, y: touch.clientY };
        },
      ),
    );

    this.gestures.add(
      fromEvent<TouchEvent>(sheet, "touchmove", { passive: false }).subscribe(
        (event) => {
          const touch = event.touches[0];
          if (!touch) {
            return;
          }

          if (dragging && touchStart) {
            event.preventDefault();
            follow(touch.clientY);
            return;
          }

          if (!touchStart) {
            return;
          }

          const dx = touch.clientX - touchStart.x;
          const dy = touch.clientY - touchStart.y;
          if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
            return;
          }

          const pullsDown = dy > 0 && dy >= Math.abs(dx);
          const owned = event.defaultPrevented || !event.cancelable;
          if (!pullsDown || owned || !canDrag()) {
            touchStart = null;
            return;
          }

          event.preventDefault();
          begin(touchStart.y);
          follow(touch.clientY);
        },
      ),
    );

    this.gestures.add(
      merge(
        fromEvent<TouchEvent>(sheet, "touchend"),
        fromEvent<TouchEvent>(sheet, "touchcancel"),
      ).subscribe(() => {
        const wasDragging = dragging && touchStart !== null;
        touchStart = null;
        if (!wasDragging) {
          return;
        }

        release();
      }),
    );
  }

  private claimsContentDrag(sheet: HTMLElement, target: Element): boolean {
    if (target.closest(".ds-sheet__grab, input, textarea, select")) {
      return false;
    }

    if (target.closest("[contenteditable], [data-sheet-no-drag]")) {
      return false;
    }

    let node: Element | null = target;
    while (node && node !== sheet) {
      if (node.scrollTop > 0) {
        return false;
      }

      node = node.parentElement;
    }

    return true;
  }

  private resist(offset: number): number {
    if (offset >= 0) {
      return offset;
    }

    return -Math.min(24, Math.sqrt(-offset) * 3);
  }

  private settle(sheet: HTMLElement): void {
    sheet.style.transition = "transform var(--ds-dur-4) var(--ds-ease-spring)";
    sheet.style.removeProperty("transform");
    this.overlayNode?.style.removeProperty("--ds-sheet-scrim");
  }

  private holdHeight(sheet: HTMLElement): void {
    if (this.closing()) {
      return;
    }

    const height = sheet.offsetHeight;
    if (height <= this.tallestSeen) {
      return;
    }

    this.tallestSeen = height;
    sheet.style.minHeight = `min(${height}px, var(--ds-sheet-max))`;
  }

  private detachGestures(): void {
    this.gestures?.unsubscribe();
    this.gestures = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.sheetNode = null;
  }

  private inheritModule(node: HTMLElement): void {
    const module = this.host.nativeElement
      .closest("[data-module]")
      ?.getAttribute("data-module");
    if (!module) return;

    this.renderer.setAttribute(node, "data-module", module);
  }

  private detachOverlay(): void {
    if (!this.overlayNode) {
      return;
    }

    this.overlayNode.remove();
    this.overlayNode = null;
  }

  private toggleOverlayEffects(active: boolean): void {
    if (active) {
      this.scrollLock.lock(this);
      this.statusBarTint.tint(this);
      this.presentedSheets.present(this);

      return;
    }

    this.scrollLock.release(this);
    this.statusBarTint.release(this);
    this.presentedSheets.dismiss(this);
  }
}
