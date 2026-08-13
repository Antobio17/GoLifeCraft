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
        font-size: 0.75rem;
        padding: 0.9375rem 0.5rem;
        border: 1.5px dashed var(--ds-border-strong);
        border-radius: 0.875rem;
      }
    `,
  ],
})
export class PlaceholderNoteComponent {
  @Input() message = "";
}
