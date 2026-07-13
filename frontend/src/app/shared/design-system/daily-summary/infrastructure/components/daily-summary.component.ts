import { Component, Input } from "@angular/core";
import { ProgressRingComponent } from "../../../progress-ring/infrastructure/components/progress-ring.component";

export type SummaryMacroTone = "protein" | "fat" | "carbs";

export interface SummaryMacro {
  label: string;
  value: string;
  tone: SummaryMacroTone;
}

@Component({
  selector: "ds-daily-summary",
  standalone: true,
  imports: [ProgressRingComponent],
  templateUrl: "./daily-summary.component.html",
  styleUrls: ["./daily-summary.component.css"],
})
export class DailySummaryComponent {
  @Input() progressPercent = 0;
  @Input() consumedKcal: string | null = "";
  @Input() targetKcal: string | null = "";
  @Input() kcalLabel = "";
  @Input() macros: SummaryMacro[] = [];
}
