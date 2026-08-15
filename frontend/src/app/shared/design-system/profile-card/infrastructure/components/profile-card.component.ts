import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-profile-card",
  template: `
    <div class="pc">
      <span class="pc__avatar">{{ initial }}</span>
      <div class="pc__body">
        <div class="pc__name">{{ name }}</div>
        <div class="pc__email">{{ email }}</div>
        <div class="pc__meta">
          <span class="pc__role">{{ roleLabel }}</span>
          <span class="pc__status">
            <span class="pc__dot" [class.pc__dot--on]="active"></span>
            {{ activeLabel }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .pc {
        display: flex;
        align-items: center;
        gap: var(--ds-space-3);
        background: var(--ds-surface-inset);
        color: var(--ds-text);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-4);
      }
      .pc__avatar {
        flex: 0 0 auto;
        width: 3.375rem;
        height: 3.375rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-primary);
        color: var(--ds-on-primary);
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-2xl);
      }
      .pc__body {
        flex: 1 1 auto;
        min-width: 0;
      }
      .pc__name {
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: var(--ds-text-xl);
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pc__email {
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pc__meta {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1-5);
        margin-top: var(--ds-space-1-5);
      }
      .pc__role {
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ds-primary-soft-text);
        background: var(--ds-primary-soft);
        border-radius: var(--ds-radius-sm);
        padding: var(--ds-space-1) var(--ds-space-2);
      }
      .pc__status {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        color: var(--ds-text-muted);
      }
      .pc__dot {
        width: 0.4375rem;
        height: 0.4375rem;
        border-radius: 50%;
        background: var(--ds-text-meta);
      }
      .pc__dot--on {
        background: var(--ds-success);
        box-shadow: 0 0 0 0.1875rem
          color-mix(in srgb, var(--ds-success) 26%, transparent);
      }
    `,
  ],
})
export class ProfileCardComponent {
  @Input() initial = "";
  @Input() name = "";
  @Input() email = "";
  @Input() roleLabel = "";
  @Input() active = false;
  @Input() activeLabel = "";
}
