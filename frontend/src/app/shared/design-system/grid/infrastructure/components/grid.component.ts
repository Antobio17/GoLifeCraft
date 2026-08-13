import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-grid",
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--grid-gap, var(--ds-space-3));
        grid-template-columns: repeat(
          var(--grid-cols, auto-fill),
          minmax(min(var(--grid-min, 15rem), 100%), 1fr)
        );
      }

      @media (min-width: 769px) and (max-width: 1279px) {
        :host(.ds-grid--tablet) {
          grid-template-columns: repeat(
            var(--grid-tablet-cols),
            minmax(0, 1fr)
          );
        }
      }
    `,
  ],
  host: {
    "[style.--grid-gap]": "gap",
    "[style.--grid-min]": "columns === null ? minColumn : '0px'",
    "[style.--grid-cols]": "columns === null ? 'auto-fill' : columns",
    "[style.--grid-tablet-cols]": "tabletColumns",
    "[class.ds-grid--tablet]": "tabletColumns !== null",
  },
})
export class GridComponent {
  @Input() minColumn = "15rem";
  @Input() gap = "var(--ds-space-3)";
  @Input() columns: number | null = null;
  @Input() tabletColumns: number | null = null;
}
