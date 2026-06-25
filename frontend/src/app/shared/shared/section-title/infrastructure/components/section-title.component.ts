import { Component, Input } from "@angular/core";
import { IconChipComponent } from "../../../icon-chip/infrastructure/components/icon-chip.component";
import { IconChipTone } from "../../../icon-chip/domain/models/icon-chip.model";

@Component({
  selector: "app-section-title",
  templateUrl: "./section-title.component.html",
  styleUrls: ["./section-title.component.css"],
  imports: [IconChipComponent],
})
export class SectionTitleComponent {
  @Input() icon!: string;
  @Input() iconTone: IconChipTone = "sky";
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() counter?: number | string;
}
