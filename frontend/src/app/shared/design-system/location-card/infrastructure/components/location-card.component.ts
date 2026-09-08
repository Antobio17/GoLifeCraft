import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "ds-location-card",
  imports: [MacroBadgesComponent],
  template: `
    <button type="button" class="ds-loccard" (click)="activated.emit()">
      <span class="ds-loccard__emoji">{{ emoji }}</span>
      <span class="ds-loccard__body">
        <span class="ds-loccard__name">{{ name }}</span>
        @if (description) {
          <span class="ds-loccard__meta">{{ description }}</span>
        }
        @if (badges.length) {
          <ds-macro-badges class="ds-loccard__badges" [macros]="badges" />
        }
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .ds-loccard {
        display: flex;
        gap: var(--ds-space-3);
        width: 100%;
        height: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-2);
        box-shadow: var(--ds-elev);
        transition:
          border-color var(--ds-dur-2) var(--ds-ease-out),
          background var(--ds-dur-2) var(--ds-ease-out),
          box-shadow var(--ds-dur-3) var(--ds-ease-in-out),
          transform var(--ds-dur-3) var(--ds-ease-in-out);
      }
      .ds-loccard:hover {
        border-color: var(--ds-border-strong);
        background: var(--ds-surface-hover);
        box-shadow: var(--ds-elev-lg);
        transform: translateY(-2px);
      }
      .ds-loccard__emoji {
        width: 3.5rem;
        height: 3.5rem;
        flex: 0 0 auto;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface-inset);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--ds-text-2xl);
        overflow: hidden;
      }
      .ds-loccard__body {
        flex: 1 1 auto;
        min-width: 0;
        display: block;
      }
      .ds-loccard__name {
        display: block;
        font-size: var(--ds-text-md);
        font-weight: 700;
        line-height: 1.2;
        color: var(--ds-text);
      }
      .ds-loccard__meta {
        display: block;
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ds-loccard__badges {
        display: block;
        margin-top: var(--ds-space-2);
      }
    `,
  ],
})
export class LocationCardComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() description = "";
  @Input() badges: MacroBadge[] = [];

  @Output() activated = new EventEmitter<void>();
}
