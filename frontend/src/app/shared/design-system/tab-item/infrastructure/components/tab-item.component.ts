import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-tab-item",
  imports: [IconComponent],
  template: `
    <span
      class="tab"
      [class.tab--active]="active"
      [class.tab--icon-only]="iconOnly"
    >
      <span class="tab__icon">
        <ds-icon [name]="icon" [size]="20" [stroke]="2.2" />
        @if (live) {
          <span class="tab__live"></span>
        }
      </span>
      <span class="tab__label">{{ label }}</span>
    </span>
  `,
  styles: [
    `
      :host {
        flex: 1;
        display: block;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .tab {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 3rem;
        padding: 0 var(--ds-space-3);
        border-radius: var(--ds-radius-pill);
        color: var(--ds-text-meta);
        text-decoration: none;
        transition:
          background-color var(--ds-dur-3) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out),
          padding var(--ds-dur-3) var(--ds-ease-spring),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      :host(:hover) .tab:not(.tab--active) {
        color: var(--ds-text-muted);
      }
      :host(:active) .tab {
        transform: scale(0.92);
      }
      .tab__icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }
      .tab__live {
        position: absolute;
        top: -0.1875rem;
        right: -0.3125rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ds-primary);
        box-shadow: 0 0 0 2px var(--ds-surface);
        animation: tabLive 1.6s var(--ds-ease-in-out) infinite;
      }
      .tab__label {
        max-width: 0;
        overflow: hidden;
        opacity: 0;
        font-family: var(--ds-font-display, inherit);
        font-size: var(--ds-text-base);
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
        transition:
          max-width var(--ds-dur-3) var(--ds-ease-spring),
          padding-left var(--ds-dur-3) var(--ds-ease-spring),
          opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      .tab--active {
        color: var(--ds-on-primary);
        background-color: var(--ds-primary);
        padding: 0 var(--ds-space-4) 0 var(--ds-space-3);
      }
      .tab--active .tab__live {
        background: var(--ds-on-primary);
        box-shadow: 0 0 0 2px var(--ds-primary);
      }
      .tab--active .tab__label {
        max-width: 10rem;
        opacity: 1;
        padding-left: var(--ds-space-2);
      }
      .tab--icon-only,
      .tab--active.tab--icon-only {
        padding: 0 var(--ds-space-3);
      }
      .tab--icon-only .tab__label,
      .tab--active.tab--icon-only .tab__label {
        max-width: 0;
        opacity: 0;
        padding-left: 0;
      }
      @keyframes tabLive {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.45;
          transform: scale(0.75);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .tab,
        .tab__label {
          transition: none;
        }
        .tab__live {
          animation: none;
        }
      }
    `,
  ],
})
export class TabItemComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() active = false;
  @Input() iconOnly = false;
  @Input() live = false;
}
