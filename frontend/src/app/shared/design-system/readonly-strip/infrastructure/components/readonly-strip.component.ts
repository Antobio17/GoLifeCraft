import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-readonly-strip",
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
        gap: var(--ds-space-2);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-space-3);
      }
      .rs__main {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .rs__label {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .rs__value {
        margin-top: 2px;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .rs__note {
        flex: 0 0 auto;
        font-size: var(--ds-text-xs);
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
