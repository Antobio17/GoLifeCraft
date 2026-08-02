import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-check-row",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="ds-checkrow"
      role="checkbox"
      [class.is-off]="!checked"
      [attr.aria-checked]="checked"
      (click)="toggled.emit()"
    >
      <span class="ds-checkrow__box" [class.is-on]="checked">
        <ds-icon name="check" [size]="15" [stroke]="3" />
      </span>
      @if (emoji) {
        <span class="ds-checkrow__emoji">{{ emoji }}</span>
      }
      <span class="ds-checkrow__text">
        <span class="ds-checkrow__name">{{ name }}</span>
        <span class="ds-checkrow__meta">{{ meta }}</span>
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-checkrow {
        display: flex;
        align-items: center;
        gap: 11px;
        width: 100%;
        text-align: left;
        appearance: none;
        border: none;
        cursor: pointer;
        background: var(--ds-surface-inset);
        border-radius: 14px;
        padding: 9px 11px;
        font: inherit;
        color: inherit;
        transition: opacity var(--ds-transition-fast);
      }
      .ds-checkrow.is-off {
        opacity: 0.5;
      }
      .ds-checkrow__box {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        background: var(--ds-surface);
        border: 1.5px solid var(--ds-border-strong);
        color: transparent;
        transition:
          background var(--ds-transition-fast),
          color var(--ds-transition-fast);
      }
      .ds-checkrow__box.is-on {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
        color: var(--ds-on-primary);
      }
      .ds-checkrow__emoji {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 11px;
        background: var(--ds-surface);
        font-size: 18px;
      }
      .ds-checkrow__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-checkrow__name {
        font-size: 13px;
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-checkrow__meta {
        font-size: 10.5px;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class CheckRowComponent {
  @Input() name = "";
  @Input() meta = "";
  @Input() emoji = "";
  @Input() checked = false;

  @Output() toggled = new EventEmitter<void>();
}
