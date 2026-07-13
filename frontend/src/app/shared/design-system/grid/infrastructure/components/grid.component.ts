import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-grid",
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--grid-gap, 12px);
        grid-template-columns: repeat(
          var(--grid-cols, auto-fill),
          minmax(min(var(--grid-min, 240px), 100%), 1fr)
        );
      }
    `,
  ],
  host: {
    "[style.--grid-gap]": "gap",
    "[style.--grid-min]": "columns === null ? minColumn : '0px'",
    "[style.--grid-cols]": "columns === null ? 'auto-fill' : columns",
  },
})
export class GridComponent {
  @Input() minColumn = "240px";
  @Input() gap = "12px";
  @Input() columns: number | null = null;
}
