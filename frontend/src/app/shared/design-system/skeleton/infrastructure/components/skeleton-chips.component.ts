import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-chips",
  standalone: true,
  template: `
    <div class="skchip" [class.skchip--wrap]="wrap">
      @for (chip of chipArray; track chip; let i = $index) {
        <span
          class="ds-sk skchip__item"
          [style.width]="widthFor(i)"
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
        gap: var(--skchip-gap, 7px);
        overflow: hidden;
      }
      .skchip--wrap {
        flex-wrap: wrap;
        overflow: visible;
      }
      .skchip__item {
        flex: 0 0 auto;
        height: var(--skchip-h, 32px);
        border-radius: var(--ds-radius-pill);
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
  @Input() height = "32px";
  @Input() gap = "7px";
  @Input() wrap = false;
  @Input() widths: string[] = ["96px", "78px", "112px", "86px", "70px"];

  get chipArray(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }

  widthFor(index: number): string {
    return this.widths[index % this.widths.length];
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
