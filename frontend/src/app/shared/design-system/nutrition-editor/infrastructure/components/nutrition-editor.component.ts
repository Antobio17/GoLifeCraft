import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-nutrition-editor",
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
        border-radius: var(--ds-radius-xl);
        overflow: hidden;
        background: var(--ds-surface);
      }
      .ds-nedit__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--ds-space-3) var(--ds-space-4);
        border-bottom: 1px solid var(--ds-border);
      }
      .ds-nedit__title {
        font-size: var(--ds-text-sm);
        font-weight: 800;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: var(--ds-text);
      }
      .ds-nedit__badge {
        font-size: var(--ds-text-xs);
        font-weight: 800;
        color: var(--ds-text-muted);
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-pill);
        padding: var(--ds-space-1) var(--ds-space-2);
      }
    `,
  ],
})
export class NutritionEditorComponent {
  @Input() title = "";
  @Input() badge = "";
}
