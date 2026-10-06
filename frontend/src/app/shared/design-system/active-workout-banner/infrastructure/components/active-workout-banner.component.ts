import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-active-workout-banner",
  imports: [IconComponent],
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
})
export class ActiveWorkoutBannerComponent {
  @Input() paused = false;
  @Input() stateLabel = "";
  @Input() elapsedLabel = "";
  @Input() restVisible = false;
  @Input() restLabel = "";
  @Input() restCaption = "";
  @Input() restOverTarget = false;
  @Input() restProgress = 0;
  @Input() doneCount = 0;
  @Input() totalSets = 0;
  @Input() setsLabel = "";
  @Input() finishing = false;
  @Input() finishLabel = "";
  @Input() pauseLabel = "";
  @Input() resumeLabel = "";
  @Input() stopLabel = "";
  @Input() finishAriaLabel = "";
  @Input() pauseAriaLabel = "";
  @Input() stopAriaLabel = "";

  @Output() finished = new EventEmitter<void>();
  @Output() pauseToggle = new EventEmitter<void>();
  @Output() stopped = new EventEmitter<void>();

  private static readonly RING_CIRCUMFERENCE = 2 * Math.PI * 28;

  get ringDash(): string {
    const circumference = ActiveWorkoutBannerComponent.RING_CIRCUMFERENCE;
    const ratio =
      this.totalSets > 0 ? Math.min(1, this.doneCount / this.totalSets) : 0;

    return `${(ratio * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
  }
}
