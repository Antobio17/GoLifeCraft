import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SkeletonFormSectionComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-form-section.component";
import { IconComponent } from "@shared/design-system/icon/infrastructure/components/icon.component";
import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";

@Component({
  selector: "ds-section-page-wrapper",
  templateUrl: "./section-page-wrapper.component.html",
  styleUrls: ["./section-page-wrapper.component.css"],
  imports: [SkeletonFormSectionComponent, IconComponent],
})
export class SectionPageWrapperComponent {
  @Input() icon?: DsIconName;
  @Input() title = "";
  @Input() description = "";
  @Input() loading = false;
  @Input() skeletonRows = 3;
  @Input() skeletonFieldsPerRow = 2;
  @Input() skeletonCards = 2;
  @Input() showBackButton = false;
  @Output() backClicked = new EventEmitter<void>();
}
