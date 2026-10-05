import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-action-bar",
  imports: [IconComponent],
  template: `
    <div class="ds-abar">
      <span class="ds-abar__text">
        <span class="ds-abar__title">{{ title }}</span>
        @if (subtitle) {
          <span class="ds-abar__subtitle">{{ subtitle }}</span>
        }
      </span>
      <button
        type="button"
        class="ds-abar__action"
        [disabled]="disabled"
        (click)="activated.emit()"
      >
        <ds-icon [name]="icon" [size]="16" />
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-abar {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        padding: var(--ds-space-2) var(--ds-space-2) var(--ds-space-2)
          var(--ds-space-4);
        border-radius: var(--ds-radius-2xl);
        background: var(--ds-surface);
        border: 1px solid var(--ds-primary-soft-border);
        box-shadow: var(--ds-shadow-card);
      }
      .ds-abar__text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ds-abar__title {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-abar__subtitle {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ds-abar__action {
        appearance: none;
        flex: 0 0 auto;
        height: 3.125rem;
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        padding: 0 var(--ds-space-5);
        border: none;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-lg);
        font-weight: var(--ds-weight-bold);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      .ds-abar__action:active:not(:disabled) {
        transform: scale(0.96);
      }
      .ds-abar__action:disabled {
        opacity: 0.55;
        cursor: default;
      }
      .ds-abar__action:focus-visible {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
    `,
  ],
})
export class ActionBarComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() actionLabel = "";
  @Input() icon: DsIconName = "play";
  @Input() disabled = false;

  @Output() activated = new EventEmitter<void>();
}
