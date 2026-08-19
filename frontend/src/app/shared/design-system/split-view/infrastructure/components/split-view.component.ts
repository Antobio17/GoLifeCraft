import { Component, Input } from "@angular/core";

type SplitViewSide = "start" | "end";

@Component({
  selector: "ds-split-view",
  template: `
    <div class="split">
      <div class="split__side" [class.split__side--sticky]="sticky">
        <ng-content select="[slot='side']"></ng-content>
      </div>
      <div class="split__main">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }

      .split {
        display: flex;
        flex-direction: column;
        gap: var(--split-gap, var(--ds-space-3));
      }

      .split__side,
      .split__main {
        display: flex;
        flex-direction: column;
        gap: var(--split-gap, var(--ds-space-3));
        min-width: 0;
      }

      :host(.ds-split--end) .split__side {
        order: 1;
      }

      @media (min-width: 1000px) {
        .split {
          display: grid;
          grid-template-columns: var(
            --split-columns,
            minmax(0, 1fr) minmax(0, 1fr)
          );
          align-items: start;
          column-gap: var(--split-column-gap, var(--ds-space-5));
        }

        .split__side--sticky {
          position: sticky;
          top: var(--ds-space-5);
        }
      }
    `,
  ],
  host: {
    "[style.--split-gap]": "gap",
    "[style.--split-columns]": "columns",
    "[style.--split-column-gap]": "columnGap",
    "[class.ds-split--end]": "side === 'end'",
  },
})
export class SplitViewComponent {
  @Input() gap = "var(--ds-space-3)";
  @Input() columnGap = "var(--ds-space-5)";
  @Input() columns = "minmax(0, 1fr) minmax(0, 1fr)";
  @Input() side: SplitViewSide = "start";
  @Input() sticky = false;
}
