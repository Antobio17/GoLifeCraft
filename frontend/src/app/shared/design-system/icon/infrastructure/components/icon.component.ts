import { Component, Input, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { DS_ICONS, DsIconName } from "../../domain/models/icon.model";

@Component({
  selector: "ds-icon",
  standalone: true,
  template: `<span
    class="ds-icon"
    [style.width.px]="size"
    [style.height.px]="size"
    [innerHTML]="markup"
  ></span>`,
  styles: [
    `
      .ds-icon {
        display: inline-flex;
        flex: 0 0 auto;
        line-height: 0;
        color: inherit;
      }
      .ds-icon ::ng-deep svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  @Input({ required: true }) name!: DsIconName;
  @Input() size = 20;
  @Input() stroke = 2;

  get markup(): SafeHtml {
    const inner = DS_ICONS[this.name] ?? "";
    const svg =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
      ` stroke-width="${this.stroke}" stroke-linecap="round"` +
      ` stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
