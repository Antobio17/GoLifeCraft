import { Component, Input } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

type HeadingSize = "sm" | "md" | "lg" | "xl";

@Component({
  selector: "ds-heading",
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #content><ng-content></ng-content></ng-template>
    @switch (level) {
      @case (3) {
        <h3 class="ds-heading">
          <ng-container [ngTemplateOutlet]="content" />
        </h3>
      }
      @case (4) {
        <h4 class="ds-heading">
          <ng-container [ngTemplateOutlet]="content" />
        </h4>
      }
      @default {
        <h2 class="ds-heading">
          <ng-container [ngTemplateOutlet]="content" />
        </h2>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .ds-heading {
        margin: 0;
        font-family: var(--ds-font-display);
        font-weight: var(--ds-weight-extrabold);
        line-height: var(--ds-leading-tight);
        letter-spacing: var(--ds-tracking-tight);
        color: var(--ds-text);
        font-size: var(--heading-size, var(--ds-text-xl));
      }
      :host([truncate]) .ds-heading {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
  host: {
    "[attr.truncate]": "truncate ? '' : null",
    "[style.--heading-size]": "sizeToken",
  },
})
export class HeadingComponent {
  @Input() level: 2 | 3 | 4 = 2;
  @Input() size: HeadingSize = "lg";
  @Input() truncate = false;

  private readonly sizes: Record<HeadingSize, string> = {
    sm: "var(--ds-text-md)",
    md: "var(--ds-text-lg)",
    lg: "var(--ds-text-xl)",
    xl: "var(--ds-text-2xl)",
  };

  get sizeToken(): string {
    return this.sizes[this.size];
  }
}
