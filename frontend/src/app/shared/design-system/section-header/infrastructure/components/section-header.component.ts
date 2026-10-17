import { Component, EventEmitter, Input, Output } from "@angular/core";

type SectionHeaderSize = "sm" | "md";

@Component({
  selector: "ds-section-header",
  template: `
    <div class="ds-shead">
      <h2 class="ds-shead__title" [class.ds-shead__title--md]="size === 'md'">
        {{ title }}
      </h2>
      <div class="ds-shead__end">
        @if (actionLabel) {
          <button
            type="button"
            class="ds-shead__action"
            (click)="action.emit()"
          >
            {{ actionLabel }} ›
          </button>
        } @else if (staticLabel) {
          <span class="ds-shead__label">{{ staticLabel }}</span>
        }
        <ng-content select="[slot=trailing]" />
      </div>
    </div>
    @if (caption) {
      <p class="ds-shead__caption">{{ caption }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-shead {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ds-shead__end {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
      }
      .ds-shead__title {
        margin: 0;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-md);
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-shead__title--md {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: 800;
      }
      .ds-shead__action {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-sm);
        font-weight: 700;
        color: var(--ds-primary);
      }
      .ds-shead__caption {
        margin: var(--ds-space-1) 0 0;
        font-size: var(--ds-text-sm);
        line-height: 1.4;
        color: var(--ds-text-meta);
      }
      .ds-shead__label {
        font-size: var(--ds-text-sm);
        font-weight: 700;
        color: var(--ds-text-meta);
      }
      @media (pointer: coarse) {
        .ds-shead__action {
          position: relative;
        }
        .ds-shead__action::after {
          content: "";
          position: absolute;
          inset: var(--ds-tap-slop-y) var(--ds-tap-slop-x);
        }
      }
    `,
  ],
})
export class SectionHeaderComponent {
  @Input() title = "";
  @Input() actionLabel = "";
  @Input() staticLabel = "";
  @Input() caption = "";
  @Input() size: SectionHeaderSize = "sm";

  @Output() action = new EventEmitter<void>();
}
