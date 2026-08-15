import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-floating-workout-banner",
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="workout-banner"
      [class.workout-banner--paused]="paused"
      [attr.aria-label]="goLabel"
      (click)="go.emit()"
    >
      <span class="workout-banner__pulse"></span>
      <span class="workout-banner__state">{{ stateLabel }}</span>
      <span class="workout-banner__time">{{ elapsedLabel }}</span>
      <span class="workout-banner__name">{{ name }}</span>
      <ds-icon class="workout-banner__go" name="chevronRight" [size]="16" />
    </button>
  `,
  styleUrls: ["./floating-workout-banner.component.css"],
})
export class FloatingWorkoutBannerComponent {
  @Input() paused = false;
  @Input() stateLabel = "";
  @Input() elapsedLabel = "";
  @Input() name = "";
  @Input() goLabel = "";

  @Output() go = new EventEmitter<void>();
}
