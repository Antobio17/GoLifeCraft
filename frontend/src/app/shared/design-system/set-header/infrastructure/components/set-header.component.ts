import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-set-header",
  standalone: true,
  template: `
    <div class="ds-seth">
      <span class="ds-seth__num">{{ numLabel }}</span>
      <span class="ds-seth__col">{{ repsLabel }}</span>
      <span class="ds-seth__col">{{ weightLabel }}</span>
      @if (doneCol) {
        <span class="ds-seth__done"></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-seth {
        display: flex;
        gap: 6px;
        padding: 0 6px;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--ds-text-meta);
      }
      .ds-seth__num {
        width: 34px;
      }
      .ds-seth__col {
        flex: 1 1 0;
        min-width: 0;
        text-align: center;
      }
      .ds-seth__done {
        width: 30px;
        flex: 0 0 auto;
      }
    `,
  ],
})
export class SetHeaderComponent {
  @Input() numLabel = "";
  @Input() repsLabel = "";
  @Input() weightLabel = "";
  @Input() doneCol = false;
}
