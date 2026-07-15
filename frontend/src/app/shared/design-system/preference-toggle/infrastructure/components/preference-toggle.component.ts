import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-preference-toggle",
  standalone: true,
  template: `
    <button
      type="button"
      class="pt"
      role="switch"
      [attr.aria-checked]="checked"
      [attr.aria-label]="title"
      (click)="toggled.emit()"
    >
      <span class="pt__icon">{{ icon }}</span>
      <span class="pt__text">
        <span class="pt__title">{{ title }}</span>
        <span class="pt__sub">{{ subtitle }}</span>
      </span>
      <span class="pt__track" [class.pt__track--on]="checked">
        <span class="pt__knob"></span>
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .pt {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 13px 14px;
        border-radius: var(--ds-radius-2xl);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        cursor: pointer;
        text-align: left;
        font-family: var(--ds-font-body);
      }
      .pt__icon {
        flex: 0 0 auto;
        font-size: 16px;
        line-height: 1;
      }
      .pt__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .pt__title {
        font-size: 13.5px;
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
      }
      .pt__sub {
        font-size: 11px;
        color: var(--ds-text-muted);
      }
      .pt__track {
        flex: 0 0 auto;
        width: 46px;
        height: 26px;
        padding: 2px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-inset);
        border: 1px solid var(--ds-border-strong);
        transition:
          background var(--ds-transition-base),
          border-color var(--ds-transition-base);
      }
      .pt__track--on {
        background: var(--ds-primary);
        border-color: var(--ds-primary);
      }
      .pt__knob {
        display: block;
        width: 20px;
        height: 20px;
        border-radius: var(--ds-radius-pill);
        background: var(--ds-surface-raised);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        transition: transform var(--ds-transition-base);
      }
      .pt__track--on .pt__knob {
        transform: translateX(20px);
      }
    `,
  ],
})
export class PreferenceToggleComponent {
  @Input() icon = "";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() checked = false;

  @Output() toggled = new EventEmitter<void>();
}
