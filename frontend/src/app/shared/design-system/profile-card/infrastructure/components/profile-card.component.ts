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
        gap: 0.8125rem;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border: 1px solid
          color-mix(in srgb, var(--ds-on-surface-brand) 8%, transparent);
        border-radius: var(--ds-radius-3xl);
        padding: 0.9375rem 1rem;
      }
      .pc__avatar {
        flex: 0 0 auto;
        width: 3.375rem;
        height: 3.375rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: 1.375rem;
      }
      .pc__body {
        flex: 1 1 auto;
        min-width: 0;
      }
      .pc__name {
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: 1.0625rem;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pc__email {
        font-size: 0.75rem;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pc__meta {
        display: flex;
        align-items: center;
        gap: 0.4375rem;
        margin-top: 0.4375rem;
      }
      .pc__role {
        font-size: 0.59375rem;
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 14%,
          transparent
        );
        border-radius: 0.4375rem;
        padding: 0.1875rem 0.5rem;
      }
      .pc__status {
        display: inline-flex;
        align-items: center;
        gap: 0.3125rem;
        font-size: 0.65625rem;
        font-weight: var(--ds-weight-bold);
        opacity: 0.85;
      }
      .pc__dot {
        width: 0.4375rem;
        height: 0.4375rem;
        border-radius: 50%;
        background: var(--ds-text-meta);
      }
      .pc__dot--on {
        background: var(--ds-accent);
        box-shadow: 0 0 0 0.1875rem
          color-mix(in srgb, var(--ds-accent) 30%, transparent);
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
