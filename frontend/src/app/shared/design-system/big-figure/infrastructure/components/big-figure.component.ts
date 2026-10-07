import { Component, input } from "@angular/core";

@Component({
  selector: "ds-big-figure",
  template: `
    <p class="ds-bfig">
      <span class="ds-bfig__value">{{ value() }}</span>
      @if (suffix()) {
        <span class="ds-bfig__suffix">{{ suffix() }}</span>
      }
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-bfig {
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        column-gap: var(--ds-space-2);
      }
      .ds-bfig__value {
        font-family: var(--ds-font-display);
        font-size: 2.125rem;
        font-weight: var(--ds-weight-bold);
        line-height: 1;
        letter-spacing: -0.04em;
        font-variant-numeric: tabular-nums;
        color: var(--ds-text);
      }
      .ds-bfig__suffix {
        font-size: var(--ds-text-md);
        font-weight: var(--ds-weight-semibold);
        color: var(--ds-text-muted);
      }
    `,
  ],
})
export class BigFigureComponent {
  readonly value = input<string | number>("");
  readonly suffix = input("");
}
