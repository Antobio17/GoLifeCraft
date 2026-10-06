import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, fromEvent, map, merge, startWith } from "rxjs";

const STICKY_OFFSET_PROPERTY = "--ds-sticky-header-offset";

export type ScreenHeaderLeading = "back" | "close" | null;

@Component({
  selector: "ds-screen-header",
  imports: [NgTemplateOutlet],
  template: `
    <header class="ds-screen-head">
      <div #bar class="ds-screen-head__bar">
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

        @if (stacked()) {
          <span class="ds-screen-head__mini" aria-hidden="true">{{
            title
          }}</span>
        } @else if (title) {
          <ng-container [ngTemplateOutlet]="text" />
        }

        <div class="ds-screen-head__actions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>

      @if (stacked() && title) {
        <ng-container [ngTemplateOutlet]="text" />
      }
    </header>

    <ng-template #text>
      <div #large class="ds-screen-head__text">
        @if (eyebrow) {
          <span class="ds-screen-head__eyebrow">{{ eyebrow }}</span>
        }
        @if (titleActionLabel) {
          <h1 class="ds-screen-head__title ds-screen-head__title--action">
            <button
              type="button"
              class="ds-screen-head__title-link"
              [attr.aria-label]="titleActionLabel + ': ' + title"
              (click)="titleClick.emit()"
            >
              <span
                class="ds-screen-head__title-text"
                [class.ds-screen-head__title--wrap]="wrapTitle || stacked()"
                >{{ title }}</span
              >
              <svg
                class="ds-screen-head__title-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </h1>
        } @else {
          <h1
            class="ds-screen-head__title"
            [class.ds-screen-head__title--wrap]="wrapTitle || stacked()"
          >
            {{ title }}
          </h1>
        }
        @if (subtitle) {
          <p class="ds-screen-head__subtitle">{{ subtitle }}</p>
        }
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host(.is-stacked),
      :host(.is-stacked) .ds-screen-head {
        display: contents;
      }
      :host(.is-sticky:not(.is-stacked)) {
        display: block;
      }
      :host(.is-sticky:not(.is-stacked)),
      :host(.is-sticky.is-stacked) .ds-screen-head__bar {
        --screen-head-bleed: var(--ds-space-4);
        position: sticky;
        top: env(safe-area-inset-top);
        z-index: 20;
        padding-block: var(--ds-space-2);
        margin-block: calc(-1 * var(--ds-space-2));
        background: var(--ds-bg);
        box-shadow:
          0 0 0 var(--screen-head-bleed) var(--ds-bg),
          0 calc(-1 * env(safe-area-inset-top)) 0 var(--screen-head-bleed)
            var(--ds-bg);
        clip-path: inset(
          calc(-1 * (var(--screen-head-bleed) + env(safe-area-inset-top)))
            calc(-1 * var(--screen-head-bleed)) -1px
        );
      }
      :host(.is-sticky:not(.is-stacked))::after,
      :host(.is-sticky.is-stacked) .ds-screen-head__bar::after {
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
      :host(.is-scrolled:not(.is-stacked))::after,
      :host(.is-compact) .ds-screen-head__bar::after {
        opacity: 1;
      }
      .ds-screen-head__bar {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
      }
      .ds-screen-head__mini {
        flex: 1 1 auto;
        min-width: 0;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-lg);
        letter-spacing: -0.01em;
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: 0;
        transform: translateY(0.5rem);
        transition:
          opacity var(--ds-dur-3) var(--ds-ease-out),
          transform var(--ds-dur-3) var(--ds-ease-out);
      }
      :host(.is-compact) .ds-screen-head__mini {
        opacity: 1;
        transform: none;
      }
      :host(.is-stacked) .ds-screen-head__text {
        flex: none;
        --screen-head-lines: 3;
        opacity: calc(1 - var(--screen-head-progress, 0) * 1.4);
        transform: translateY(calc(var(--screen-head-progress, 0) * -0.375rem))
          scale(calc(1 - var(--screen-head-progress, 0) * 0.06));
        transform-origin: left bottom;
      }
      @media (prefers-reduced-motion: reduce) {
        .ds-screen-head__mini {
          transform: none;
          transition: none;
        }
        :host(.is-stacked) .ds-screen-head__text {
          transform: none;
        }
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
        border-radius: var(--ds-radius-control);
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
        -webkit-line-clamp: var(--screen-head-lines, 2);
        line-clamp: var(--screen-head-lines, 2);
      }
      .ds-screen-head__title--action {
        white-space: normal;
        overflow: visible;
      }
      .ds-screen-head__title-link {
        appearance: none;
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        font: inherit;
        letter-spacing: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        max-width: 100%;
        border-radius: var(--ds-radius-mark);
      }
      .ds-screen-head__title-link:focus-visible {
        outline: 2px solid var(--ds-primary);
        outline-offset: 2px;
      }
      .ds-screen-head__title-text {
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-screen-head__title-text.ds-screen-head__title--wrap {
        white-space: normal;
      }
      .ds-screen-head__title-chevron {
        flex: 0 0 auto;
        color: var(--ds-text-meta);
        transition: transform var(--ds-dur-2) var(--ds-ease-out);
      }
      .ds-screen-head__title-link:hover .ds-screen-head__title-chevron {
        transform: translateX(2px);
      }
      .ds-screen-head__subtitle {
        margin: 2px 0 0;
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
      .ds-screen-head__actions {
        flex: 0 0 auto;
        margin-left: auto;
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
    "[class.is-sticky]": "sticky()",
    "[class.is-scrolled]": "sticky() && scrolled()",
    "[class.is-stacked]": "stacked()",
    "[class.is-compact]": "stacked() && sticky() && compact()",
  },
})
export class ScreenHeaderComponent {
  private static readonly COMPACT_AT = 0.75;
  private static readonly PROGRESS_PROPERTY = "--screen-head-progress";

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bar = viewChild<ElementRef<HTMLElement>>("bar");
  private readonly large = viewChild<ElementRef<HTMLElement>>("large");

  protected readonly scrolled = signal(false);
  protected readonly compact = signal(false);

  @Input() leading: ScreenHeaderLeading = null;
  @Input() leadingLabel = "";
  @Input() eyebrow: string | null = null;
  @Input() title = "";
  @Input() wrapTitle = false;
  @Input() subtitle: string | null = null;
  readonly sticky = input(false);
  readonly stacked = input(false);
  @Input() titleActionLabel = "";
  @Output() leadingClick = new EventEmitter<void>();
  @Output() titleClick = new EventEmitter<void>();

  constructor() {
    this.trackScroll();
    this.trackLargeTitle();
    effect((onCleanup) => {
      const target = this.stacked()
        ? this.bar()?.nativeElement
        : this.host.nativeElement;
      if (!this.sticky() || !target) {
        return;
      }

      onCleanup(this.publishOffset(target));
    });
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

  private trackLargeTitle(): void {
    afterNextRender(() => this.followLargeTitle());
    merge(
      fromEvent(window, "scroll", { passive: true }),
      fromEvent(window, "resize", { passive: true }),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.followLargeTitle());
  }

  private followLargeTitle(): void {
    const bar = this.bar()?.nativeElement;
    const large = this.large()?.nativeElement;
    if (!this.stacked() || !this.sticky() || !bar || !large) {
      this.host.nativeElement.style.removeProperty(
        ScreenHeaderComponent.PROGRESS_PROPERTY,
      );
      this.compact.set(false);
      return;
    }

    const barBottom = bar.getBoundingClientRect().bottom;
    const { top, height } = large.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (barBottom - top) / height));

    this.host.nativeElement.style.setProperty(
      ScreenHeaderComponent.PROGRESS_PROPERTY,
      `${progress}`,
    );
    this.compact.set(progress >= ScreenHeaderComponent.COMPACT_AT);
  }

  private publishOffset(target: HTMLElement): () => void {
    const rootStyle = document.documentElement.style;
    const observer = new ResizeObserver(([entry]) =>
      rootStyle.setProperty(
        STICKY_OFFSET_PROPERTY,
        `${entry.borderBoxSize[0].blockSize}px`,
      ),
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
      rootStyle.removeProperty(STICKY_OFFSET_PROPERTY);
    };
  }
}
