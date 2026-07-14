import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "ds-recipe-card",
  standalone: true,
  template: `
    <button type="button" class="ds-rcard" (click)="activated.emit()">
      <span class="ds-rcard__emoji">{{ emoji }}</span>
      <span class="ds-rcard__body">
        <span class="ds-rcard__head">
          <span class="ds-rcard__name">{{ name }}</span>
          <span class="ds-rcard__kcal">{{ kcal }} {{ kcalUnit }}</span>
        </span>
        <span class="ds-rcard__meta">{{ meta }}</span>
        <span class="ds-rcard__chips">
          <span class="ds-rcard__chip">{{ proteinShort }} {{ protein }}</span>
          <span class="ds-rcard__chip">{{ fatShort }} {{ fat }}</span>
          <span class="ds-rcard__chip">{{ carbsShort }} {{ carbs }}</span>
          @if (hasSubRecipe) {
            <span class="ds-rcard__chip ds-rcard__chip--tag">{{
              subRecipeLabel
            }}</span>
          }
        </span>
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
      .ds-rcard__head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: flex-start;
      }
      .ds-rcard__name {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
      }
      .ds-rcard__kcal {
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        border-radius: 7px;
        padding: 3px 7px;
        font-size: 10.5px;
        font-weight: 800;
        white-space: nowrap;
        flex: 0 0 auto;
      }
      .ds-rcard__meta {
        font-size: 11px;
        color: var(--ds-text-muted);
        margin-top: 3px;
      }
      .ds-rcard__chips {
        display: flex;
        gap: 5px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .ds-rcard__chip {
        background: var(--ds-surface-inset);
        border-radius: 7px;
        padding: 3px 6px;
        font-size: 10.5px;
        font-weight: 600;
      }
      .ds-rcard__chip--tag {
        background: var(--ds-accent-soft);
        color: var(--ds-accent-soft-text);
        font-weight: 700;
      }
    `,
  ],
})
export class RecipeCardComponent {
  @Input() emoji = "";
  @Input() name = "";
  @Input() kcal: string | number = "";
  @Input() kcalUnit = "kcal";
  @Input() meta = "";
  @Input() protein: string | number = "";
  @Input() fat: string | number = "";
  @Input() carbs: string | number = "";
  @Input() proteinShort = "P";
  @Input() fatShort = "G";
  @Input() carbsShort = "H";
  @Input() hasSubRecipe = false;
  @Input() subRecipeLabel = "Con subrecetas";

  @Output() activated = new EventEmitter<void>();
}
