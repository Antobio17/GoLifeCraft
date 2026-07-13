import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-nutrition-editor",
  standalone: true,
  template: `
    <div class="ds-nedit">
      <div class="ds-nedit__head">
        <span class="ds-nedit__title">{{ title }}</span>
        @if (badge) {
          <span class="ds-nedit__badge">{{ badge }}</span>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-nedit {
        border: 1px solid var(--ds-border);
        border-radius: 18px;
        overflow: hidden;
        background: var(--ds-surface);
      }
      .ds-nedit__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 13px 16px;
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-nedit__title {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--ds-text);
      }
      .ds-nedit__badge {
        font-size: 10px;
        font-weight: 800;
        color: var(--ds-text-muted);
        background: var(--ds-surface-inset);
        border-radius: 999px;
        padding: 4px 10px;
      }
    `,
  ],
})
export class NutritionEditorComponent {
  @Input() title = "";
  @Input() badge = "";
}
