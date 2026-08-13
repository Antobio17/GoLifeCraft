import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-chips",
  template: `
    <div
      class="skchip"
      [class.skchip--wrap]="wrap"
      [class.skchip--equal]="equal"
    >
      @for (chip of chipArray; track chip; let i = $index) {
        <span
          class="ds-sk skchip__item"
          [style.width]="widthFor(i)"
          [style.border-radius]="radius"
          [style.--ds-sk-delay]="delayFor(i)"
        ></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .skchip {
        display: flex;
        gap: var(--skchip-gap, var(--ds-space-1-5));
        overflow: hidden;
      }
      .skchip--wrap {
        flex-wrap: wrap;
        overflow: visible;
      }
      .skchip__item {
        flex: 0 0 auto;
        height: var(--skchip-h, 2rem);
        border-radius: var(--ds-radius-pill);
      }
      .skchip--equal .skchip__item {
        flex: 1 1 0;
        min-width: 0;
      }
    `,
  ],
  host: {
    "[style.--skchip-gap]": "gap",
    "[style.--skchip-h]": "height",
  },
})
export class SkeletonChipsComponent {
  @Input() count = 3;
  @Input() height = "2rem";
  @Input() gap = "var(--ds-space-1-5)";
  @Input() wrap = false;
  @Input() equal = false;
  @Input() radius: string | null = null;
  @Input() widths: string[] = [
    "6rem",
    "4.875rem",
    "7rem",
    "5.375rem",
    "4.375rem",
  ];

  get chipArray(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }

  widthFor(index: number): string | null {
    if (this.equal) return null;

    return this.widths[index % this.widths.length];
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
