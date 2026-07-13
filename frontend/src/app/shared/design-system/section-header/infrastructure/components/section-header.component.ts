import { Component, EventEmitter, Input, Output } from "@angular/core";

type SectionHeaderSize = "sm" | "md";

@Component({
  selector: "ds-section-header",
  standalone: true,
  template: `
    <div class="ds-shead">
      <h2 class="ds-shead__title" [class.ds-shead__title--md]="size === 'md'">
        {{ title }}
      </h2>
      @if (actionLabel) {
        <button type="button" class="ds-shead__action" (click)="action.emit()">
          {{ actionLabel }} ›
        </button>
      } @else if (staticLabel) {
        <span class="ds-shead__label">{{ staticLabel }}</span>
      }
    </div>
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
      .ds-shead__title {
        margin: 0;
        font-family: var(--ds-font-body);
        font-size: 13px;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-shead__title--md {
        font-family: var(--ds-font-display);
        font-size: 17px;
        font-weight: 800;
      }
      .ds-shead__action {
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        font-family: var(--ds-font-body);
        font-size: 11px;
        font-weight: 700;
        color: var(--ds-primary);
      }
      .ds-shead__label {
        font-size: 11px;
        font-weight: 700;
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class SectionHeaderComponent {
  @Input() title = "";
  @Input() actionLabel = "";
  @Input() staticLabel = "";
  @Input() size: SectionHeaderSize = "sm";

  @Output() action = new EventEmitter<void>();
}
