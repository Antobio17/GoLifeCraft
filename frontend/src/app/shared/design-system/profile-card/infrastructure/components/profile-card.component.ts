import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-profile-card",
  standalone: true,
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
        gap: 13px;
        background: var(--ds-surface-brand);
        color: var(--ds-on-surface-brand);
        border: 1px solid
          color-mix(in srgb, var(--ds-on-surface-brand) 8%, transparent);
        border-radius: var(--ds-radius-3xl);
        padding: 15px 16px;
      }
      .pc__avatar {
        flex: 0 0 auto;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: 22px;
      }
      .pc__body {
        flex: 1 1 auto;
        min-width: 0;
      }
      .pc__name {
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        font-size: 17px;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pc__email {
        font-size: 12px;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pc__meta {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 7px;
      }
      .pc__role {
        font-size: 9.5px;
        font-weight: var(--ds-weight-extrabold);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: color-mix(
          in srgb,
          var(--ds-on-surface-brand) 14%,
          transparent
        );
        border-radius: 7px;
        padding: 3px 8px;
      }
      .pc__status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 10.5px;
        font-weight: var(--ds-weight-bold);
        opacity: 0.85;
      }
      .pc__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--ds-text-meta);
      }
      .pc__dot--on {
        background: var(--ds-accent);
        box-shadow: 0 0 0 3px
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
