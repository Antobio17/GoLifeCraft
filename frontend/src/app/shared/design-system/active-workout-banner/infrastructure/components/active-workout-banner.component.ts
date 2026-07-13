import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-active-workout-banner",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
})
export class ActiveWorkoutBannerComponent {
  @Input() scrolled = false;
  @Input() paused = false;
  @Input() stateLabel = "";
  @Input() elapsedLabel = "";
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

  @ViewChild("sentinel") private sentinelRef?: ElementRef<HTMLElement>;

  get sentinelElement(): HTMLElement | undefined {
    return this.sentinelRef?.nativeElement;
  }
}
