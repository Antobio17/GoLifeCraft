import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-placeholder-note",
  template: `<div class="ds-placeholder">{{ message }}</div>`,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-placeholder {
        text-align: center;
        color: var(--ds-text-muted);
        font-size: var(--ds-text-base);
        padding: var(--ds-space-4) var(--ds-space-2);
        border: 1.5px dashed var(--ds-border-strong);
        border-radius: var(--ds-radius-lg);
      }
    `,
  ],
})
export class PlaceholderNoteComponent {
  @Input() message = "";
}
