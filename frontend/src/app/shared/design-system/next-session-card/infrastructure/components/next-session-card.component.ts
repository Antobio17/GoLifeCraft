import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { StatStripComponent } from "@shared/design-system/stat-strip/infrastructure/components/stat-strip.component";
import { StatStripItem } from "@shared/design-system/stat-strip/domain/models/stat-strip-item.model";

@Component({
  selector: "ds-next-session-card",
  imports: [IconComponent, StatStripComponent],
  template: `
    <section class="ds-next" [attr.aria-label]="eyebrow + ' · ' + title">
      <div class="ds-next__head">
        <div class="ds-next__text">
          <span class="ds-next__eyebrow">
            <span class="ds-next__pulse" aria-hidden="true"></span>
            {{ eyebrow }}
          </span>
          <span class="ds-next__title">{{ title }}</span>
          @if (caption) {
            <span class="ds-next__caption">{{ caption }}</span>
          }
        </div>
        <button
          type="button"
          class="ds-next__open"
          [attr.aria-label]="openAriaLabel"
          (click)="opened.emit()"
        >
          <ds-icon name="chevronRight" [size]="20" [stroke]="2.2" />
        </button>
      </div>

      @if (stats.length) {
        <ds-stat-strip [items]="stats" />
      }

      @if (tags.length) {
        <ul class="ds-next__tags">
          @for (tag of tags; track tag) {
            <li class="ds-next__tag">{{ tag }}</li>
          }
        </ul>
      }

      <button
        type="button"
        class="ds-next__cta"
        [disabled]="disabled"
        (click)="started.emit()"
      >
        <ds-icon name="play" [size]="18" />
        {{ ctaLabel }}
      </button>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-next {
        --ds-surface: var(--ds-sheet-surface);
        --ds-surface-inset: var(--ds-sheet-surface-inset);
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-4);
        padding: var(--ds-space-5);
        border-radius: var(--ds-radius-2xl);
        background: var(--ds-hero-bg);
        border: 1px solid var(--ds-sheet-border);
        box-shadow: var(--ds-hero-shadow);
        color: var(--ds-text);
      }
      .ds-next__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--ds-space-3);
      }
      .ds-next__text {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
        min-width: 0;
      }
      .ds-next__eyebrow {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ds-primary);
      }
      .ds-next__pulse {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ds-primary);
        box-shadow: 0 0 0 0.1875rem var(--ds-primary-soft);
      }
      .ds-next__title {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-3xl);
        font-weight: var(--ds-weight-bold);
        line-height: 1.05;
        letter-spacing: -0.02em;
        overflow-wrap: anywhere;
      }
      .ds-next__caption {
        font-size: var(--ds-text-md);
        color: var(--ds-text-muted);
      }
      .ds-next__open {
        appearance: none;
        flex: 0 0 auto;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 1px solid var(--ds-border);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-next__open:active {
        transform: scale(0.92);
      }
      .ds-next__tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-1-5);
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .ds-next__tag {
        padding: var(--ds-space-1) var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-semibold);
      }
      .ds-next__cta {
        appearance: none;
        height: 3.375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ds-space-2);
        border: none;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        cursor: pointer;
        box-shadow: var(--ds-elev-cta);
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-next__cta:active:not(:disabled) {
        transform: scale(0.98);
      }
      .ds-next__cta:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .ds-next__open:focus-visible,
      .ds-next__cta:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
    `,
  ],
})
export class NextSessionCardComponent {
  @Input() eyebrow = "";
  @Input() title = "";
  @Input() caption = "";
  @Input() stats: StatStripItem[] = [];
  @Input() tags: string[] = [];
  @Input() ctaLabel = "";
  @Input() openAriaLabel = "";
  @Input() disabled = false;

  @Output() started = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
}
