import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SkeletonFormSectionComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-form-section.component";

@Component({
  selector: "ds-section-page-wrapper",
  templateUrl: "./section-page-wrapper.component.html",
  styleUrls: ["./section-page-wrapper.component.css"],
  imports: [SkeletonFormSectionComponent],
})
export class SectionPageWrapperComponent {
  @Input() title = "";
  @Input() description = "";
  @Input() loading = false;
  @Input() skeletonRows = 3;
  @Input() skeletonFieldsPerRow = 2;
  @Input() skeletonCards = 2;
  @Input() showBackButton = false;
  @Output() backClicked = new EventEmitter<void>();
}
