import { DOCUMENT } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  inject,
} from "@angular/core";

@Component({
  selector: "ds-modal-sheet",
  standalone: true,
  template: `
    @if (open) {
      <div
        class="ds-sheet__overlay"
        tabindex="-1"
        (click)="closed.emit()"
        (keydown.escape)="closed.emit()"
      >
        <div
          class="ds-sheet"
          [class.ds-sheet--tall]="tall"
          [class.ds-sheet--compact]="compact"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
        >
          <div class="ds-sheet__grip" aria-hidden="true"></div>
          <header class="ds-sheet__header">
            <h2 class="ds-sheet__title">{{ title }}</h2>
            <button
              class="ds-sheet__close"
              type="button"
              [attr.aria-label]="closeLabel"
              (click)="closed.emit()"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18"></path>
              </svg>
            </button>
          </header>
          <div class="ds-sheet__body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        --ds-sheet-height: min(90dvh, 860px);
        --ds-sheet-height-tall: min(94dvh, 920px);
        --ds-sheet-height-compact: min(82dvh, 760px);
        --ds-sheet-max-gap: 16px;
        --ds-sheet-max-gap-desktop: 32px;
      }

      .ds-sheet__overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: var(--ds-blur-sm);
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .ds-sheet {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 480px;
        height: var(--ds-sheet-height);
        max-height: calc(100dvh - var(--ds-sheet-max-gap));
        min-height: min(76dvh, 620px);
        background: var(--ds-surface-raised);
        border: 1px solid var(--ds-border);
        border-radius: 22px 22px 0 0;
        box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.28);
        animation: ds-sheet-up 0.24s cubic-bezier(0.4, 0.2, 0.2, 1);
      }
      .ds-sheet--tall {
        height: var(--ds-sheet-height-tall);
        min-height: min(86dvh, 720px);
      }
      .ds-sheet--compact {
        height: var(--ds-sheet-height-compact);
        min-height: min(68dvh, 560px);
        max-height: calc(100dvh - 24px);
      }
      .ds-sheet__grip {
        width: 40px;
        height: 4px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-border-strong);
        margin: 10px auto 2px;
      }
      .ds-sheet__header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 18px 12px;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-sheet__title {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-sheet__close {
        appearance: none;
        border: none;
        background: var(--ds-surface-subtle);
        color: var(--ds-text-muted);
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: var(--ds-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .ds-sheet__close:hover {
        color: var(--ds-text);
      }
      .ds-sheet__body {
        flex: 1 1 auto;
        min-width: 0;
        padding: 16px 18px 22px;
        overflow-x: hidden;
        overflow-y: auto;
      }
      @keyframes ds-sheet-up {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
      @media (min-width: 640px) {
        .ds-sheet__overlay {
          align-items: center;
        }
        .ds-sheet {
          border-radius: 22px;
          max-height: calc(100dvh - var(--ds-sheet-max-gap-desktop));
          animation-name: ds-sheet-pop;
        }
        .ds-sheet--tall {
          max-height: calc(100dvh - 24px);
        }
        .ds-sheet--compact {
          max-height: calc(100dvh - 40px);
        }
        .ds-sheet__grip {
          display: none;
        }
      }
      @keyframes ds-sheet-pop {
        from {
          opacity: 0;
          transform: scale(0.94) translateY(12px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-sheet {
          animation: none;
        }
      }
    `,
  ],
})
export class ModalSheetComponent implements OnDestroy {
  private static readonly SCROLL_LOCK_CLASS = "ds-scroll-locked";

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  private isOpen = false;

  @Input()
  set open(value: boolean) {
    this.isOpen = value;
    this.toggleScrollLock(value);
  }

  get open(): boolean {
    return this.isOpen;
  }

  @Input() tall = false;
  @Input() compact = false;
  @Input() title = "";
  @Input() closeLabel = "Close";
  @Output() closed = new EventEmitter<void>();

  ngOnDestroy(): void {
    this.toggleScrollLock(false);
  }

  private toggleScrollLock(locked: boolean): void {
    const body = this.document.body;

    if (locked) {
      this.renderer.addClass(body, ModalSheetComponent.SCROLL_LOCK_CLASS);
      return;
    }

    this.renderer.removeClass(body, ModalSheetComponent.SCROLL_LOCK_CLASS);
  }
}
