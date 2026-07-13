import { Component } from "@angular/core";

@Component({
  selector: "ds-form-row",
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      @media (max-width: 768px) {
        :host {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class FormRowComponent {}
