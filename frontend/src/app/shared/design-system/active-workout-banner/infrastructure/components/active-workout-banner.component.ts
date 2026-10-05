import {
  AfterViewInit,
  Component,
  OnChanges,
  SimpleChanges,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { IconComponent } from "../../../icon/infrastructure/components/icon.component";

@Component({
  selector: "ds-active-workout-banner",
  imports: [IconComponent],
  templateUrl: "./active-workout-banner.component.html",
  styleUrls: ["./active-workout-banner.component.css"],
})
export class ActiveWorkoutBannerComponent implements AfterViewInit, OnChanges {
  private destroyRef = inject(DestroyRef);
  private expandedHeight = 0;
  private settling = false;

  protected readonly compensation = signal(0);

  @Input() scrolled = false;
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

  private static readonly RING_CIRCUMFERENCE = 2 * Math.PI * 27;

  get ringDash(): string {
    const circumference = ActiveWorkoutBannerComponent.RING_CIRCUMFERENCE;
    const ratio =
      this.totalSets > 0 ? Math.min(1, this.doneCount / this.totalSets) : 0;

    return `${(ratio * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
  }

  @ViewChild("sentinel") private sentinelRef?: ElementRef<HTMLElement>;
  @ViewChild("panel") private panelRef?: ElementRef<HTMLElement>;

  get sentinelElement(): HTMLElement | undefined {
    return this.sentinelRef?.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["scrolled"] || this.scrolled) {
      return;
    }

    this.settling = !changes["scrolled"].firstChange;
  }

  onPanelTransitionEnd(event: TransitionEvent): void {
    const panel = this.panelRef?.nativeElement;

    if (!panel || event.target !== panel || this.scrolled) {
      return;
    }

    this.settling = false;
    this.compensate(panel);
  }

  ngAfterViewInit(): void {
    const panel = this.panelRef?.nativeElement;

    if (!panel) {
      return;
    }

    const observer = new ResizeObserver(() => this.compensate(panel));
    observer.observe(panel);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private compensate(panel: HTMLElement): void {
    const height = panel.offsetHeight;

    if (this.settling && height >= this.expandedHeight) {
      this.settling = false;
    }

    if (this.scrolled || this.settling) {
      this.compensation.set(Math.max(0, this.expandedHeight - height));
      return;
    }

    this.expandedHeight = height;
    this.compensation.set(0);
  }
}
