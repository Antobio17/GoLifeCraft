import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SkeletonFormSectionComponent } from "@shared/shared/skeleton/infrastructure/components/skeleton-form-section.component";

@Component({
  selector: "app-section-page-wrapper",
  templateUrl: "./section-page-wrapper.component.html",
  styleUrls: ["./section-page-wrapper.component.css"],
  imports: [SkeletonFormSectionComponent],
})
export class SectionPageWrapperComponent {
  @Input() title: string = "";
  @Input() description: string = "";
  @Input() loading: boolean = false;
  @Input() skeletonRows: number = 3;
  @Input() skeletonFieldsPerRow: number = 2;
  @Input() skeletonCards: number = 2;
  @Input() showBackButton: boolean = false;
  @Output() backClicked = new EventEmitter<void>();
}
