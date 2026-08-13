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
        gap: 0.75rem;
        width: 100%;
        height: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 1rem;
        padding: 0.6875rem;
        transition: border-color var(--ds-transition-fast);
      }
      .ds-rcard:hover {
        border-color: var(--ds-border-strong);
      }
      .ds-rcard__emoji {
        width: 3.625rem;
        height: 3.625rem;
        border-radius: 0.875rem;
        background: var(--ds-surface-inset);
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
      }
      .ds-rcard__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ds-rcard__name {
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1.2;
      }
      .ds-rcard__meta {
        font-size: 0.6875rem;
        color: var(--ds-text-muted);
        margin-top: 0.1875rem;
      }
      .ds-rcard__badges {
        margin-top: 0.5rem;
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
