import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, fromEvent, map, startWith } from "rxjs";

const STICKY_OFFSET_PROPERTY = "--ds-sticky-header-offset";

export type ScreenHeaderLeading = "back" | "close" | null;

@Component({
  selector: "ds-screen-header",
  template: `
    <header class="ds-screen-head">
      @if (leading) {
        <button
          type="button"
          class="ds-screen-head__lead"
          [attr.aria-label]="leadingLabel"
          (click)="leadingClick.emit()"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            @if (leading === "back") {
              <path d="M15 5l-7 7 7 7" />
            } @else {
              <path d="M18 6L6 18M6 6l12 12" />
            }
          </svg>
        </button>
      }

      <div class="ds-screen-head__text">
        @if (eyebrow) {
          <span class="ds-screen-head__eyebrow">{{ eyebrow }}</span>
        }
        <h1
          class="ds-screen-head__title"
          [class.ds-screen-head__title--wrap]="wrapTitle"
        >
          {{ title }}
        </h1>
        @if (subtitle) {
          <p class="ds-screen-head__subtitle">{{ subtitle }}</p>
        }
      </div>

      <div class="ds-screen-head__actions">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      :host(.is-sticky) {
        --screen-head-bleed: var(--ds-space-4);
        display: block;
        position: sticky;
        top: env(safe-area-inset-top);
        z-index: 20;
        padding-block: var(--ds-space-2);
        margin-block: calc(-1 * var(--ds-space-2));
        background: var(--ds-bg);
        box-shadow: 0 0 0 var(--screen-head-bleed) var(--ds-bg);
        clip-path: inset(
          calc(-1 * var(--screen-head-bleed))
            calc(-1 * var(--screen-head-bleed)) -1px
        );
      }
      :host(.is-sticky)::after {
        content: "";
        position: absolute;
        left: calc(-1 * var(--screen-head-bleed));
        right: calc(-1 * var(--screen-head-bleed));
        bottom: -1px;
        height: 1px;
        background: var(--ds-border);
        opacity: 0;
        transition: opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      :host(.is-scrolled)::after {
        opacity: 1;
      }
      .ds-screen-head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
      }
      .ds-screen-head__lead {
        flex: 0 0 auto;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        box-sizing: border-box;
        line-height: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        appearance: none;
        border: none;
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        border-radius: var(--ds-radius-lg);
        cursor: pointer;
        transition: background var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-screen-head__lead:hover {
        background: color-mix(in srgb, var(--ds-surface-inset) 88%, black);
      }
      .ds-screen-head__text {
        flex: 1 1 auto;
        min-width: 0;
      }
      .ds-screen-head__eyebrow {
        display: block;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-screen-head__title {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-2xl);
        letter-spacing: -0.02em;
        color: var(--ds-text);
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-screen-head__title--wrap {
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
      }
      .ds-screen-head__subtitle {
        margin: 2px 0 0;
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-screen-head__actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
      }
      .ds-screen-head__actions:empty {
        display: none;
      }
    `,
  ],
  host: {
    "[class.is-sticky]": "sticky",
    "[class.is-scrolled]": "sticky && scrolled()",
  },
})
export class ScreenHeaderComponent implements OnInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly scrolled = signal(false);

  @Input() leading: ScreenHeaderLeading = null;
  @Input() leadingLabel = "";
  @Input() eyebrow: string | null = null;
  @Input() title = "";
  @Input() wrapTitle = false;
  @Input() subtitle: string | null = null;
  @Input() sticky = false;
  @Output() leadingClick = new EventEmitter<void>();

  ngOnInit(): void {
    if (!this.sticky) {
      return;
    }

    this.trackScroll();
    this.publishOffset();
  }

  private trackScroll(): void {
    fromEvent(window, "scroll", { passive: true })
      .pipe(
        startWith(null),
        map(() => window.scrollY > 0),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((scrolled) => this.scrolled.set(scrolled));
  }

  private publishOffset(): void {
    const rootStyle = document.documentElement.style;
    const observer = new ResizeObserver(([entry]) =>
      rootStyle.setProperty(
        STICKY_OFFSET_PROPERTY,
        `${entry.borderBoxSize[0].blockSize}px`,
      ),
    );

    observer.observe(this.host.nativeElement);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      rootStyle.removeProperty(STICKY_OFFSET_PROPERTY);
    });
  }
}
