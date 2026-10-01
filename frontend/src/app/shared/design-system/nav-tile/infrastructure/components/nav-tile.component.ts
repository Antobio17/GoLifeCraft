import { NgTemplateOutlet } from "@angular/common";
import { Component, Input } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { DsIconName } from "../../../icon/domain/models/icon.model";

@Component({
  selector: "ds-nav-tile",
  imports: [IconComponent, NgTemplateOutlet],
  template: `
    <ng-template #content>
      <span class="tile__icon">
        <ds-icon [name]="icon" [size]="22" [stroke]="1.9" />
        @if (badge) {
          <span class="tile__badge"></span>
        }
      </span>
      <span class="tile__label">{{ label }}</span>
    </ng-template>

    @if (href) {
      <a class="tile" [href]="href">
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <span class="tile">
        <ng-container [ngTemplateOutlet]="content" />
      </span>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--ds-space-1-5);
        padding: var(--ds-space-1) 0;
        color: var(--ds-text);
        text-decoration: none;
        transition: transform var(--ds-dur-1) var(--ds-ease-out);
      }
      :host(:active) .tile {
        transform: scale(0.94);
      }
      .tile__icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3.25rem;
        height: 3.25rem;
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface-inset);
        color: var(--ds-text-muted);
        transition:
          background var(--ds-dur-2) var(--ds-ease-out),
          color var(--ds-dur-2) var(--ds-ease-out);
      }
      :host(:hover) .tile__icon {
        background: var(--ds-surface-hover);
        color: var(--ds-text);
      }
      .tile__badge {
        position: absolute;
        top: var(--ds-space-1-5);
        right: var(--ds-space-1-5);
        width: 0.4375rem;
        height: 0.4375rem;
        border-radius: 50%;
        background: var(--ds-accent);
      }
      .tile__label {
        max-width: 100%;
        font-size: var(--ds-text-base);
        font-weight: 600;
        line-height: 1.2;
        text-align: center;
        overflow-wrap: anywhere;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      :host(.is-active) .tile__icon {
        background: var(--ds-primary-soft);
        color: var(--ds-primary);
      }
      :host(.is-active) .tile__label {
        color: var(--ds-primary);
        font-weight: 700;
      }
      :host(:focus-visible) {
        outline: none;
      }
      :host(:focus-visible) .tile__icon {
        outline: 2px solid var(--ds-border-focus);
        outline-offset: 2px;
      }
    `,
  ],
})
export class NavTileComponent {
  @Input({ required: true }) icon!: DsIconName;
  @Input() label = "";
  @Input() badge = "";
  @Input() href = "";
}
