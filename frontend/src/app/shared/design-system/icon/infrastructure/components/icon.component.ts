import { Component, computed, inject, input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { DS_ICONS, DsIconName } from "../../domain/models/icon.model";
import { DsIconTone } from "../../domain/models/icon-tone.model";

@Component({
  selector: "ds-icon",
  template: `<span
    class="ds-icon"
    [style.width.px]="size()"
    [style.height.px]="size()"
    [innerHTML]="markup()"
  ></span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
      :host([tone="warning"]) {
        color: var(--ds-warning);
      }
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
  host: {
    "[attr.tone]": "tone()",
    "[attr.role]": "label() ? 'img' : null",
    "[attr.aria-label]": "label()",
  },
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);

  readonly name = input.required<DsIconName>();
  readonly size = input(20);
  readonly stroke = input(2);
  readonly tone = input<DsIconTone>("inherit");
  readonly label = input<string | null>(null);

  readonly markup = computed<SafeHtml>(() => {
    const inner = DS_ICONS[this.name()] ?? "";
    const svg =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
      ` stroke-width="${this.stroke()}" stroke-linecap="round"` +
      ` stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}
