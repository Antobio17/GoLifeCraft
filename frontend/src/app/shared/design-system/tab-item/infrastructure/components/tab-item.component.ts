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
      [class.tab--compact]="compact"
    >
      <span class="tab__indicator"></span>
      <span class="tab__icon">
        <ds-icon [name]="icon" [size]="22" [stroke]="active ? 2.3 : 1.9" />
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
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--ds-space-1);
        min-height: 3.5rem;
        padding: var(--ds-space-1-5) var(--ds-space-1);
        color: var(--ds-text-meta);
        text-decoration: none;
        transition:
          color var(--ds-dur-2) var(--ds-ease-out),
          transform var(--ds-dur-1) var(--ds-ease-out);
      }
      :host(:hover) .tab:not(.tab--active) {
        color: var(--ds-text-muted);
      }
      :host(:active) .tab {
        transform: scale(0.94);
      }
      .tab__indicator {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 1.75rem;
        height: 3px;
        margin: 0 auto;
        border-radius: 0 0 var(--ds-radius-sm) var(--ds-radius-sm);
        background: var(--ds-primary);
        transform: scaleX(0);
        transition: transform var(--ds-dur-3) var(--ds-ease-spring);
      }
      .tab__icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        transition: transform var(--ds-dur-3) var(--ds-ease-out);
      }
      .tab__live {
        position: absolute;
        top: -0.125rem;
        right: -0.3125rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ds-primary);
        box-shadow: 0 0 0 2px var(--ds-surface);
        animation: tabLive 1.6s var(--ds-ease-in-out) infinite;
      }
      .tab__label {
        font-size: var(--ds-text-xs);
        font-weight: 600;
        line-height: 1;
        letter-spacing: 0.01em;
        white-space: nowrap;
        transition: opacity var(--ds-dur-2) var(--ds-ease-out);
      }
      .tab--active {
        color: var(--ds-primary);
      }
      .tab--active .tab__indicator {
        transform: scaleX(1);
      }
      .tab--active .tab__label {
        font-weight: 700;
      }
      .tab--compact .tab__label {
        opacity: 0;
      }
      .tab--compact .tab__indicator {
        transform: scaleX(0);
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
        .tab__indicator,
        .tab__icon,
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
  @Input() compact = false;
  @Input() live = false;
}
