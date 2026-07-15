import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-placeholder-note",
  standalone: true,
  template: `<div class="ds-placeholder">{{ message }}</div>`,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-placeholder {
        text-align: center;
        color: var(--ds-text-muted);
        font-size: 12px;
        padding: 15px 8px;
        border: 1.5px dashed var(--ds-border-strong);
        border-radius: 14px;
      }
    `,
  ],
})
export class PlaceholderNoteComponent {
  @Input() message = "";
}
