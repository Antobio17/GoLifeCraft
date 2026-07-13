import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-floating-workout-banner",
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="workout-banner" [class.workout-banner--paused]="paused">
      <span class="workout-banner__pulse"></span>

      <div class="workout-banner__info">
        <span class="workout-banner__state">{{ stateLabel }}</span>
        <div class="workout-banner__meta">
          <span class="workout-banner__time">{{ elapsedLabel }}</span>
          <span class="workout-banner__name">{{ name }}</span>
        </div>
      </div>

      <button type="button" class="workout-banner__go" (click)="go.emit()">
        {{ goLabel }}
      </button>

      <button
        type="button"
        class="workout-banner__stop"
        [attr.aria-label]="stopAriaLabel"
        (click)="stop.emit()"
      >
        <ds-icon name="square" [size]="14" />
      </button>
    </div>
  `,
  styleUrls: ["./floating-workout-banner.component.css"],
})
export class FloatingWorkoutBannerComponent {
  @Input() paused = false;
  @Input() stateLabel = "";
  @Input() elapsedLabel = "";
  @Input() name = "";
  @Input() goLabel = "";
  @Input() stopAriaLabel = "";

  @Output() go = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
}
