import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MacroBadgesComponent } from "../../../macro-badges/infrastructure/components/macro-badges.component";
import { MacroBadge } from "../../../macro-badges/domain/models/macro-badge.model";

@Component({
  selector: "ds-recipe-card",
  standalone: true,
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
        gap: 12px;
        width: 100%;
        height: 100%;
        text-align: left;
        appearance: none;
        font: inherit;
        color: inherit;
        cursor: pointer;
        background: var(--ds-surface);
        border: 1px solid var(--ds-border);
        border-radius: 16px;
        padding: 11px;
        transition: border-color var(--ds-transition-fast);
      }
      .ds-rcard:hover {
        border-color: var(--ds-border-strong);
      }
      .ds-rcard__emoji {
        width: 58px;
        height: 58px;
        border-radius: 14px;
        background: var(--ds-surface-inset);
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      }
      .ds-rcard__body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .ds-rcard__name {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
      }
      .ds-rcard__meta {
        font-size: 11px;
        color: var(--ds-text-muted);
        margin-top: 3px;
      }
      .ds-rcard__badges {
        margin-top: 8px;
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
