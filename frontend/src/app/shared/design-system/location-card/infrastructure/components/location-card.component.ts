import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";
import { LocationCardBadge } from "../../domain/models/location-card-badge.model";

@Component({
  selector: "ds-location-card",
  imports: [IconComponent],
  template: `
    <div class="ds-loccard">
      <button type="button" class="ds-loccard__main" (click)="activated.emit()">
        <span class="ds-loccard__emoji">{{ emoji }}</span>
        <span class="ds-loccard__body">
          <span class="ds-loccard__name">{{ name }}</span>
          @if (description) {
            <span class="ds-loccard__meta">{{ description }}</span>
          }
          @if (badges.length) {
            <span class="ds-loccard__badges">
              @for (badge of badges; track badge.label) {
                <span class="ds-loccard__badge">
                  <ds-icon
                    class="ds-loccard__badgeIcon"
                    [name]="badge.icon"
                    [size]="13"
                    [stroke]="2.2"
                  />
                  {{ badge.label }}
                </span>
              }
            </span>
          }
        </span>
      </button>

      <span class="ds-loccard__actions">
        <ng-content select="[slot=actions]"></ng-content>
      </span>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .ds-loccard {
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-1);
        width: 100%;
        height: 100%;
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
      .ds-loccard__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        gap: var(--ds-space-3);
        text-align: left;
        appearance: none;
        border: none;
        background: transparent;
        padding: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;
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
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ds-space-1);
        margin-top: var(--ds-space-2);
      }
      .ds-loccard__badge {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-1);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-sm);
        padding: var(--ds-space-1) var(--ds-space-1-5);
        font-size: var(--ds-text-xs);
        font-weight: 600;
        color: var(--ds-text-muted);
        white-space: nowrap;
      }
      .ds-loccard__badgeIcon {
        color: var(--ds-primary);
        flex: 0 0 auto;
      }
      .ds-loccard__actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: var(--ds-space-1);
      }
      .ds-loccard__actions:empty {
        display: none;
      }
    `,
  ],
})
export class LocationCardComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() description = "";
  @Input() badges: LocationCardBadge[] = [];

  @Output() activated = new EventEmitter<void>();
}
