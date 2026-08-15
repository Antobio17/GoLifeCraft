import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

@Component({
  selector: "ds-entity-card",
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #body>
      <h3 class="ds-entity-card__title">{{ title }}</h3>
      @if (meta) {
        <p class="ds-entity-card__meta">{{ meta }}</p>
      }
      @if (tags.length) {
        <div class="ds-entity-card__tags">
          @for (tag of tags; track tag) {
            <span class="ds-entity-card__tag">{{ tag }}</span>
          }
        </div>
      }
    </ng-template>

    <div class="ds-entity-card" [class.is-clickable]="clickable">
      @if (clickable) {
        <button
          type="button"
          class="ds-entity-card__main ds-entity-card__hit"
          (click)="activated.emit()"
        >
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </button>
      } @else {
        <div class="ds-entity-card__main">
          <ng-container *ngTemplateOutlet="body"></ng-container>
        </div>
      }
      <div class="ds-entity-card__actions">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .ds-entity-card {
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-3);
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        padding: var(--ds-space-4);
        box-shadow: var(--ds-shadow-card);
        transition:
          border-color 0.15s ease,
          box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .ds-entity-card.is-clickable:hover {
        border-color: var(--ds-primary-soft-border);
        box-shadow: var(--ds-elev-lg);
        transform: translateY(-2px);
      }
      .ds-entity-card.is-clickable:active {
        transform: scale(0.995);
      }
      .ds-entity-card__main {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1-5);
      }
      .ds-entity-card__hit {
        appearance: none;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        font: inherit;
        color: inherit;
        padding: 0;
      }
      .ds-entity-card__title {
        margin: 0;
        font-family: var(--ds-font-display);
        font-size: var(--ds-text-xl);
        font-weight: var(--ds-weight-bold);
        letter-spacing: -0.01em;
        color: var(--ds-text);
        line-height: 1.2;
      }
      .ds-entity-card__meta {
        margin: 0;
        font-size: var(--ds-text-base);
        color: var(--ds-text-muted);
      }
      .ds-entity-card__tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ds-space-1-5);
        margin-top: 2px;
      }
      .ds-entity-card__tag {
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-primary-soft-text);
        background: var(--ds-primary-soft);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1) var(--ds-space-2);
      }
      .ds-entity-card__actions {
        display: flex;
        align-items: center;
        gap: var(--ds-space-1);
        flex: 0 0 auto;
      }
      .ds-entity-card__actions:empty {
        display: none;
      }
    `,
  ],
})
export class EntityCardComponent {
  @Input() title = "";
  @Input() meta = "";
  @Input() tags: string[] = [];
  @Input() clickable = false;
  @Output() activated = new EventEmitter<void>();
}
