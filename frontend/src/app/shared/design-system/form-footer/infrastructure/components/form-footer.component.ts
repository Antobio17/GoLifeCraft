import { Component } from "@angular/core";

@Component({
  selector: "ds-form-footer",
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        position: sticky;
        bottom: 0;
        display: flex;
        justify-content: flex-end;
        padding: 16px 0 0;
        margin-top: 8px;
        border-top: 1px solid var(--ds-border);
        background: transparent;
        z-index: 5;
      }
    `,
  ],
})
export class FormFooterComponent {}
