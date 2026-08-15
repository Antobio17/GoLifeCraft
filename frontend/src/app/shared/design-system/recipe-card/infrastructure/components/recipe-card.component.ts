import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "ds-recipe-card",
  imports: [MacroBadgesComponent],
  template: `
    <button type="button" class="ds-rcard" (click)="activated.emit()">
      <span class="ds-rcard__emoji">{{ emoji }}</span>
      <span class="ds-rcard__body">
        <span class="ds-rcard__name">{{ name }}</span>
        <span class="ds-rcard__meta">{{ meta }}</span>
        <ds-macro-badges
          class="ds-rcard__badges"
          [kcal]="kcal"
          [macros]="macros"
          [tag]="hasSubRecipe ? subRecipeLabel : ''"
        />
      </span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-rcard {
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
        padding: var(--ds-space-3);
        box-shadow: var(--ds-elev);
        transition:
          border-color var(--ds-transition-fast),
          box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
          transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .ds-rcard:hover {
        border-color: var(--ds-border-strong);
        box-shadow: var(--ds-elev-lg);
        transform: translateY(-2px);
      }
      .ds-rcard__emoji {
        width: 3.625rem;
        height: 3.625rem;
        border-radius: var(--ds-radius-lg);
        background: var(--ds-surface-inset);
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--ds-text-2xl);
      }
      .ds-rcard__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ds-rcard__name {
        font-size: var(--ds-text-md);
        font-weight: 700;
        line-height: 1.2;
      }
      .ds-rcard__meta {
        font-size: var(--ds-text-sm);
        color: var(--ds-text-muted);
        margin-top: var(--ds-space-1);
      }
      .ds-rcard__badges {
        margin-top: var(--ds-space-2);
      }
    `,
  ],
})
export class RecipeCardComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() kcal = "";
  @Input() meta = "";
  @Input() macros: MacroBadge[] = [];
  @Input() hasSubRecipe = false;
  @Input() subRecipeLabel = "Con subrecetas";

  @Output() activated = new EventEmitter<void>();
}
