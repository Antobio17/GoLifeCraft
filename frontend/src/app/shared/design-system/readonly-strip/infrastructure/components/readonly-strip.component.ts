import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-readonly-strip",
  standalone: true,
  template: `
    <div class="rs">
      <div class="rs__main">
        <span class="rs__label">{{ label }}</span>
        <span class="rs__value">{{ value }}</span>
      </div>
      @if (note) {
        <span class="rs__note">{{ note }}</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .rs {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-2xl);
        padding: 11px 14px;
      }
      .rs__main {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .rs__label {
        font-size: 10px;
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .rs__value {
        margin-top: 2px;
        font-family: var(--ds-font-display);
        font-size: 13px;
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .rs__note {
        flex: 0 0 auto;
        font-size: 9.5px;
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class ReadonlyStripComponent {
  @Input() label = "";
  @Input() value = "";
  @Input() note = "";
}
