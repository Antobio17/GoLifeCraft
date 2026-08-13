import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-stock-control",
  imports: [IconComponent],
  template: `
    <section class="ds-stk">
      <div class="ds-stk__top">
        <button
          class="ds-stk__amount"
          type="button"
          [disabled]="disabled || readonly"
          [attr.aria-label]="editLabel"
          (click)="editRequested.emit()"
        >
          <span class="ds-stk__label">{{ stockLabel }}</span>
          <span class="ds-stk__main">
            {{ mainText }}
            @if (!readonly) {
              <ds-icon name="pencil" [size]="13" class="ds-stk__pencil" />
            }
          </span>
          <span class="ds-stk__sub">{{ subText }}</span>
        </button>

        @if (valueText) {
          <div class="ds-stk__value">
            <span class="ds-stk__label">{{ valueLabel }}</span>
            <span class="ds-stk__value-amount">{{ valueText }}</span>
          </div>
        }
      </div>

      @if (!readonly) {
        <div class="ds-stk__actions">
          <button
            class="ds-stk__step ds-stk__step--minus"
            type="button"
            [disabled]="disabled"
            (click)="decremented.emit()"
          >
            <ds-icon name="minus" [size]="15" [stroke]="2.6" />
            {{ stepLabel }}
          </button>
          <button
            class="ds-stk__step ds-stk__step--plus"
            type="button"
            [disabled]="disabled"
            (click)="incremented.emit()"
          >
            <ds-icon name="plus" [size]="15" [stroke]="2.6" />
            {{ stepLabel }}
          </button>
          <button
            class="ds-stk__clear"
            type="button"
            [disabled]="disabled"
            [attr.title]="clearLabel"
            [attr.aria-label]="clearLabel"
            (click)="cleared.emit()"
          >
            <ds-icon name="trash" [size]="16" [stroke]="2.2" />
          </button>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-stk {
        padding: var(--ds-space-3);
      }
      .ds-stk__top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: var(--ds-space-2);
      }
      .ds-stk__amount {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        min-width: 0;
        margin: 0;
        padding: 0;
        border: none;
        background: none;
        text-align: left;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      .ds-stk__amount:disabled {
        cursor: default;
        opacity: 0.6;
      }
      .ds-stk__label {
        font-size: var(--ds-text-xs);
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--ds-text-meta);
      }
      .ds-stk__main {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-2xl);
        font-weight: 800;
        line-height: 1.05;
        color: var(--ds-text);
      }
      .ds-stk__pencil {
        color: var(--ds-text-meta);
      }
      .ds-stk__sub {
        font-size: var(--ds-text-sm);
        font-weight: 600;
        color: var(--ds-text-muted);
      }
      .ds-stk__value {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
        text-align: right;
      }
      .ds-stk__value-amount {
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: 800;
        color: var(--ds-accent);
      }
      .ds-stk__actions {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        margin-top: var(--ds-space-3);
      }
      .ds-stk__step {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ds-space-1-5);
        border: none;
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
        font: inherit;
        font-size: var(--ds-text-md);
        font-weight: 800;
        cursor: pointer;
      }
      .ds-stk__step--minus {
        background: var(--ds-surface-inset);
        color: var(--ds-warning);
      }
      .ds-stk__step--plus {
        background: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-stk__clear {
        flex: 0 0 auto;
        width: 2.625rem;
        height: 2.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border-strong);
        border-radius: var(--ds-radius-lg);
        color: var(--ds-text-muted);
        cursor: pointer;
      }
      .ds-stk__step:disabled,
      .ds-stk__clear:disabled {
        opacity: 0.55;
        cursor: default;
      }
    `,
  ],
})
export class StockControlComponent {
  @Input() stockLabel = "";
  @Input() mainText = "";
  @Input() subText = "";
  @Input() valueLabel = "";
  @Input() valueText: string | null = null;
  @Input() stepLabel = "";
  @Input() clearLabel = "";
  @Input() editLabel = "";
  @Input() disabled = false;
  @Input() readonly = false;

  @Output() incremented = new EventEmitter<void>();
  @Output() decremented = new EventEmitter<void>();
  @Output() cleared = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<void>();
}
