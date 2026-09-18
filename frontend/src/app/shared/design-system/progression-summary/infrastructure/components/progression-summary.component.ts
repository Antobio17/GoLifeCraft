import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-progression-summary",
  template: `
    <div class="ps">
      <span class="ps__dot"></span>
      <span class="ps__text">{{ text }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ps {
        display: flex;
        align-items: center;
        gap: var(--ds-space-2);
        padding-top: var(--ds-space-2);
        border-top: 1px solid var(--ds-border-hairline);
      }
      .ps__dot {
        flex: 0 0 auto;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ds-primary);
      }
      .ps__text {
        min-width: 0;
        font-family: var(--ds-font-body);
        font-size: var(--ds-text-base);
        color: var(--ds-text-meta);
      }
    `,
  ],
})
export class ProgressionSummaryComponent {
  @Input() text = "";
}
