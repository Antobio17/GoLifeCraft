import { Component, input } from "@angular/core";
import { StackComponent } from "../../../stack/infrastructure/components/stack.component";
import { StepBadgeComponent } from "../../../step-badge/infrastructure/components/step-badge.component";

@Component({
  selector: "ds-step-line",
  imports: [StackComponent, StepBadgeComponent],
  template: `
    <ds-step-badge [label]="label()" />
    <ds-stack [gap]="gap()" [grow]="true">
      <ng-content />
    </ds-stack>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: flex-start;
        gap: var(--ds-space-3);
        min-width: 0;
        padding: var(--ds-space-3) 0;
      }
    `,
  ],
})
export class StepLineComponent {
  readonly label = input("");
  readonly gap = input("var(--ds-space-1-5)");
}
