import { Component, Input } from "@angular/core";
import { EquivalenceSummaryLine } from "../../domain/models/equivalence-summary.model";

@Component({
  selector: "ds-equivalence-summary",
  standalone: true,
  template: `
    <section class="ds-eqs">
      <header class="ds-eqs__head">
        <span class="ds-eqs__title">{{ title }}</span>
        <span class="ds-eqs__badge">{{ baseBadge }}</span>
      </header>

      <div class="ds-eqs__defaults">
        <div class="ds-eqs__default">
          <span class="ds-eqs__default-label">{{ recipeLabel }}</span>
          <span class="ds-eqs__default-value">{{ recipeUnit }}</span>
        </div>
        <div class="ds-eqs__default">
          <span class="ds-eqs__default-label">{{ diaryLabel }}</span>
          <span class="ds-eqs__default-value">{{ diaryUnit }}</span>
        </div>
      </div>

      @if (lines.length > 0) {
        <div class="ds-eqs__lines">
          <span class="ds-eqs__section">{{ equivalencesLabel }}</span>
          @for (line of lines; track $index) {
            <div class="ds-eqs__row">
              <span class="ds-eqs__row-label">{{ line.label }}</span>
              <span class="ds-eqs__row-detail">{{ line.detail }}</span>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-eqs {
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius-xl);
        background: var(--ds-surface);
        overflow: hidden;
      }
      .ds-eqs__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 11px 14px;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-eqs__title {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: var(--ds-text);
      }
      .ds-eqs__badge {
        font-size: 10px;
        font-weight: 800;
        color: var(--ds-text-muted);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-pill);
        padding: 3px 9px;
      }
      .ds-eqs__defaults {
        display: flex;
        gap: 8px;
        padding: 11px 14px;
      }
      .ds-eqs__default {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ds-eqs__default-label {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--ds-text-meta);
      }
      .ds-eqs__default-value {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-eqs__lines {
        padding: 2px 14px 10px;
      }
      .ds-eqs__section {
        display: block;
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--ds-text-meta);
        margin-bottom: 4px;
      }
      .ds-eqs__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 0;
        border-top: 1px solid var(--ds-border);
      }
      .ds-eqs__row-label {
        font-size: 12.5px;
        font-weight: 700;
        color: var(--ds-text);
      }
      .ds-eqs__row-detail {
        font-size: 12px;
        font-weight: 700;
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class EquivalenceSummaryComponent {
  @Input() title = "";
  @Input() baseBadge = "";
  @Input() recipeLabel = "";
  @Input() recipeUnit = "";
  @Input() diaryLabel = "";
  @Input() diaryUnit = "";
  @Input() equivalencesLabel = "";
  @Input() lines: EquivalenceSummaryLine[] = [];
}
