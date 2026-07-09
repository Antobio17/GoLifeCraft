import { Component, Input } from "@angular/core";

type StackDirection = "column" | "row";
type StackAlign = "stretch" | "start" | "center" | "end";
type StackJustify = "start" | "center" | "end" | "between";

@Component({
  selector: "ds-stack",
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: var(--stack-dir, column);
        gap: var(--stack-gap, 16px);
        align-items: var(--stack-align, stretch);
        justify-content: var(--stack-justify, flex-start);
        flex-wrap: var(--stack-wrap, nowrap);
        min-width: 0;
        text-align: initial;
      }
      :host([grow]) {
        flex: 1 1 auto;
      }
    `,
  ],
  host: {
    "[style.--stack-dir]": "direction",
    "[style.--stack-gap]": "gap",
    "[style.--stack-align]": "alignValue",
    "[style.--stack-justify]": "justifyValue",
    "[style.--stack-wrap]": "wrap ? 'wrap' : 'nowrap'",
    "[attr.grow]": "grow ? '' : null",
  },
})
export class StackComponent {
  @Input() direction: StackDirection = "column";
  @Input() gap = "16px";
  @Input() align: StackAlign = "stretch";
  @Input() justify: StackJustify = "start";
  @Input() wrap = false;
  @Input() grow = false;

  private readonly edges: Record<string, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    between: "space-between",
  };

  get alignValue(): string {
    return this.edges[this.align];
  }

  get justifyValue(): string {
    return this.edges[this.justify];
  }
}
