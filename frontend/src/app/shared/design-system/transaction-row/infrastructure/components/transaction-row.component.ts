import { NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PressableComponent } from "../../../pressable/infrastructure/components/pressable.component";
import { IconButtonComponent } from "../../../icon-button/infrastructure/components/icon-button.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";
import { TransactionRowTag } from "../../domain/models/transaction-row-tag.model";

@Component({
  selector: "ds-transaction-row",
  imports: [NgTemplateOutlet, PressableComponent, IconButtonComponent],
  template: `
    <div
      class="ds-tx"
      [class.ds-tx--grouped]="grouped"
      [class.ds-tx--slid]="slid"
      [class.ds-tx--muted]="muted"
    >
      @if (pressable) {
        <ds-pressable
          [grow]="true"
          [disabled]="disabled"
          [ariaLabel]="pressLabel || title"
          gap="var(--ds-space-2)"
          (press)="pressed.emit()"
        >
          <ng-container [ngTemplateOutlet]="content" />
        </ds-pressable>
      } @else {
        <ng-container [ngTemplateOutlet]="content" />
      }

      @if (actionIcon; as icon) {
        <ds-icon-button
          variant="soft"
          [icon]="icon"
          [iconSize]="16"
          [ariaLabel]="actionLabel"
          (clicked)="actioned.emit()"
        />
      }
    </div>

    <ng-template #content>
      <span class="ds-tx__chip" [class.is-income]="income">{{ emoji }}</span>
      <span class="ds-tx__body">
        <span class="ds-tx__head">
          <span class="ds-tx__title">{{ title }}</span>
          @for (tag of tags; track tag.label) {
            <span class="ds-tx__tag" [class.is-highlighted]="tag.highlighted">{{
              tag.label
            }}</span>
          }
        </span>
        <span class="ds-tx__sub">{{ subtitle }}</span>
      </span>
      <span class="ds-tx__amount" [class.is-income]="income">{{
        amountLabel
      }}</span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
      .ds-tx {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-2) var(--ds-space-3);
      }
      .ds-tx--grouped {
        background: transparent;
        border: none;
        box-shadow: none;
        border-radius: 0;
        border-bottom: 1px solid var(--ds-border);
        padding: var(--ds-space-3);
      }
      .ds-tx--grouped:last-child {
        border-bottom: none;
      }
      .ds-tx--muted .ds-tx__chip,
      .ds-tx--muted .ds-tx__title,
      .ds-tx--muted .ds-tx__amount {
        opacity: 0.55;
      }
      .ds-tx--slid {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .ds-tx__chip {
        width: 2.5rem;
        height: 2.5rem;
        flex: 0 0 auto;
        border-radius: var(--ds-radius-md);
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--ds-text-lg);
      }
      .ds-tx--grouped .ds-tx__chip {
        background: var(--ds-surface-inset);
      }
      .ds-tx__chip.is-income {
        background: var(--ds-primary-soft);
      }
      .ds-tx__body {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }
      .ds-tx__head {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        min-width: 0;
      }
      .ds-tx__title {
        flex: 0 1 auto;
        min-width: 0;
        font-size: var(--ds-text-base);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-tx__tag {
        flex: 0 0 auto;
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.04em;
        border-radius: var(--ds-radius-sm);
        padding: 0.125rem var(--ds-space-1);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
      }
      .ds-tx__tag.is-highlighted {
        background: var(--ds-primary-soft);
        color: var(--ds-primary-soft-text);
      }
      .ds-tx__sub {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-tx__amount {
        flex: 0 0 auto;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-md);
        color: var(--ds-text);
        white-space: nowrap;
      }
      .ds-tx__amount.is-income {
        color: var(--ds-success);
      }
    `,
  ],
})
export class TransactionRowComponent {
  @Input() emoji = "";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() amountLabel = "";
  @Input() grouped = false;
  @Input() income = false;
  @Input() tags: TransactionRowTag[] = [];
  @Input() pressable = false;
  @Input() pressLabel = "";
  @Input() disabled = false;
  @Input() slid = false;
  @Input() muted = false;
  @Input() actionIcon: DsIconName | null = null;
  @Input() actionLabel = "";

  @Output() pressed = new EventEmitter<void>();
  @Output() actioned = new EventEmitter<void>();
}
