import { Component, Input } from "@angular/core";

@Component({
  selector: "app-skeleton-form-section",
  templateUrl: "./skeleton-form-section.component.html",
  styleUrls: ["./skeleton-form-section.component.css"],
})
export class SkeletonFormSectionComponent {
  @Input() fieldsPerRow: number = 2;
  @Input() rows: number = 3;
  @Input() cards: number = 1;
  @Input() showHeader: boolean = false;
  @Input() showCardHeader: boolean = false;

  get fieldArray(): number[] {
    return Array.from({ length: this.fieldsPerRow }, (_, i) => i);
  }

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get cardArray(): number[] {
    return Array.from({ length: this.cards }, (_, i) => i);
  }

  get gridTemplate(): string {
    return `repeat(${this.fieldsPerRow}, 1fr)`;
  }
}
