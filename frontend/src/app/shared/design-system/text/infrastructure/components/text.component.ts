import { Component, Input } from "@angular/core";

type TextVariant = "body" | "muted" | "meta" | "label" | "strong";

@Component({
  selector: "ds-text",
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        margin: 0;
        font-family: var(--ds-font-body);
        color: var(--ds-text-body);
        font-size: var(--ds-text-base);
        line-height: var(--ds-leading-normal);
      }
      :host([inline]) {
        display: inline;
      }
      :host([variant="muted"]) {
        color: var(--ds-text-muted);
      }
      :host([variant="meta"]) {
        color: var(--ds-text-meta);
        font-size: var(--ds-text-sm);
      }
      :host([variant="strong"]) {
        color: var(--ds-text);
        font-weight: var(--ds-weight-bold);
      }
      :host([variant="label"]) {
        color: var(--ds-text-meta);
        font-size: var(--ds-text-xs);
        font-weight: var(--ds-weight-bold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      :host([truncate]) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      :host([inherit]) {
        color: inherit;
      }
      :host([inherit][variant="meta"]) {
        opacity: 0.75;
      }
    `,
  ],
  host: {
    "[attr.variant]": "variant",
    "[attr.inline]": "inline ? '' : null",
    "[attr.truncate]": "truncate ? '' : null",
    "[attr.inherit]": "inherit ? '' : null",
  },
})
export class TextComponent {
  @Input() variant: TextVariant = "body";
  @Input() inline = false;
  @Input() truncate = false;
  @Input() inherit = false;
}
