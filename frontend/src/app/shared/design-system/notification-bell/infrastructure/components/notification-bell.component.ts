import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-notification-bell",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="bell"
      [class.bell--soft]="variant === 'soft'"
      [attr.aria-label]="ariaLabel"
      (click)="clicked.emit()"
    >
      <ds-icon name="bell" [size]="iconSize" [stroke]="2.1" />
      @if (count > 0) {
        <span class="bell__badge" aria-hidden="true">{{ badge }}</span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
      }
      .bell {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--bell-size, 2.625rem);
        height: var(--bell-size, 2.625rem);
        padding: 0;
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface);
        color: var(--ds-text);
        cursor: pointer;
        transition:
          background var(--ds-transition-fast),
          transform var(--ds-dur-2) var(--ds-ease-out);
      }
      .bell--soft {
        border-color: transparent;
        background: var(--ds-surface-inset);
      }
      .bell:hover {
        background: var(--ds-surface-hover);
      }
      .bell:active {
        transform: scale(0.96);
      }
      .bell__badge {
        position: absolute;
        top: -0.1875rem;
        right: -0.1875rem;
        box-sizing: border-box;
        min-width: 1.125rem;
        height: 1.125rem;
        padding: 0 var(--ds-space-1);
        border-radius: var(--ds-radius-pill);
        border: 2px solid var(--ds-bg);
        background: var(--ds-danger);
        color: var(--ds-on-primary);
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        line-height: 0.875rem;
        text-align: center;
      }
    `,
  ],
})
export class NotificationBellComponent {
  @Input() count = 0;
  @Input() ariaLabel = "";
  @Input() iconSize = 19;
  @Input() variant: "outlined" | "soft" = "outlined";
  @Output() clicked = new EventEmitter<void>();

  get badge(): string {
    return this.count > 9 ? "9+" : String(this.count);
  }
}
