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
        gap: var(--ds-space-3);
        width: 100%;
        text-align: left;
        appearance: none;
        border: none;
        cursor: pointer;
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-2) var(--ds-space-3);
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
        width: 1.625rem;
        height: 1.625rem;
        border-radius: var(--ds-radius-md);
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
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface);
        font-size: var(--ds-text-xl);
      }
      .ds-checkrow__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-checkrow__name {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-checkrow__meta {
        font-size: var(--ds-text-xs);
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
