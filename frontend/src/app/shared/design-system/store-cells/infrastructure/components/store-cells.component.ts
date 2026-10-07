import { Component, input, output } from "@angular/core";
import { StoreCell } from "../../domain/models/store-cell.model";

@Component({
  selector: "ds-store-cells",
  template: `
    <div
      class="ds-scells"
      role="group"
      [attr.aria-label]="ariaLabel() || null"
      [style.--scells-cols]="cells().length"
    >
      @for (cell of cells(); track cell.key) {
        <button
          type="button"
          class="ds-scells__cell"
          [class.ds-scells__cell--done]="cell.done"
          [attr.data-key]="cell.key"
          [attr.aria-pressed]="cell.key === active()"
          (click)="selected.emit(cell.key)"
        >
          <span class="ds-scells__label">{{ cell.label }}</span>
          <span class="ds-scells__value">{{ cell.value }}</span>
          <span class="ds-scells__meta">{{ cell.meta }}</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-scells {
        display: grid;
        grid-template-columns: repeat(var(--scells-cols, 3), minmax(0, 1fr));
        overflow: hidden;
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-hairline);
        border-radius: var(--ds-radius-inner);
      }
      .ds-scells__cell {
        appearance: none;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        padding: var(--ds-space-2) var(--ds-space-3);
        border: 0;
        background: transparent;
        font: inherit;
        text-align: left;
        cursor: pointer;
        color: var(--ds-text);
        transition: var(--ds-motion-tint);
      }
      .ds-scells__cell + .ds-scells__cell {
        border-left: 1px solid var(--ds-border-hairline);
      }
      .ds-scells__cell[aria-pressed="true"] {
        background: var(--ds-primary-soft);
      }
      .ds-scells__cell:focus-visible {
        outline: none;
        box-shadow: inset var(--ds-focus-ring);
      }
      .ds-scells__label,
      .ds-scells__meta {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--ds-text-xs);
        color: var(--ds-text-muted);
      }
      .ds-scells__label {
        font-weight: var(--ds-weight-semibold);
      }
      .ds-scells__cell[aria-pressed="true"] .ds-scells__label {
        font-weight: var(--ds-weight-bold);
        color: var(--ds-primary-soft-text);
      }
      .ds-scells__value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: var(--ds-leading-tight);
        font-variant-numeric: tabular-nums;
      }
      .ds-scells__cell--done .ds-scells__meta {
        color: var(--ds-primary-soft-text);
        font-weight: var(--ds-weight-semibold);
      }
    `,
  ],
})
export class StoreCellsComponent {
  readonly cells = input<StoreCell[]>([]);
  readonly active = input("");
  readonly ariaLabel = input("");

  readonly selected = output<string>();
}
