import { Component } from "@angular/core";

@Component({
  selector: "ds-info-strip",
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding-bottom: 20px;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--ds-border);
      }
      @media (max-width: 768px) {
        :host {
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
      }
    `,
  ],
})
export class InfoStripComponent {}
