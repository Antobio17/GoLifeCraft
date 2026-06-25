import { Component, Input } from "@angular/core";
import { IconChipTone } from "../../../icon-chip/domain/models/icon-chip.model";
import { SectionTitleComponent } from "../../../section-title/infrastructure/components/section-title.component";
import { SectionSkeletonComponent } from "../../../section-skeleton/infrastructure/components/section-skeleton.component";

@Component({
  selector: "app-section-shell",
  templateUrl: "./section-shell.component.html",
  styleUrls: ["./section-shell.component.css"],
  imports: [SectionTitleComponent, SectionSkeletonComponent],
})
export class SectionShellComponent {
  @Input() icon!: string;
  @Input() iconTone: IconChipTone = "sky";
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;
}
