import { Component, Input } from "@angular/core";
import { MacroBadge } from "../../domain/models/macro-badge.model";

@Component({
  selector: "ds-macro-badges",
  template: `
    <span class="ds-mbadges">
      @if (kcal) {
        <span class="ds-mbadges__badge ds-mbadges__badge--kcal">{{
          kcal
        }}</span>
      }
      @for (macro of visibleMacros; track macro.label) {
        <span class="ds-mbadges__badge"
          >{{ macro.label }} {{ macro.value }}</span
        >
      }
      @if (tag) {
        <span class="ds-mbadges__badge ds-mbadges__badge--tag">{{ tag }}</span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-mbadges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ds-space-1);
      }
      .ds-mbadges__badge {
        background: var(--ds-surface-inset);
        border-radius: var(--ds-radius-sm);
        padding: var(--ds-space-1) var(--ds-space-1-5);
        font-size: var(--ds-text-xs);
        font-weight: 600;
        color: var(--ds-text-muted);
        white-space: nowrap;
      }
      .ds-mbadges__badge--kcal {
        background: var(--ds-accent);
        color: var(--ds-on-accent);
        font-weight: 800;
      }
      .ds-mbadges__badge--tag {
        background: var(--ds-accent-soft);
        color: var(--ds-accent-soft-text);
        font-weight: 700;
      }
    `,
  ],
})
export class MacroBadgesComponent {
  @Input() kcal = "";
  @Input() macros: MacroBadge[] = [];
  @Input() tag = "";

  get visibleMacros(): MacroBadge[] {
    return this.macros.filter((macro) => !!macro.value);
  }
}
