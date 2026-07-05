import { Component, Input } from "@angular/core";

@Component({
  selector: "ds-skeleton-table",
  templateUrl: "./skeleton-table.component.html",
  styleUrls: ["./skeleton-table.component.css"],
})
export class SkeletonTableComponent {
  @Input() columns: number = 4;
  @Input() rows: number = 5;
  @Input() showActions: boolean = true;
  @Input() showPagination: boolean = true;

  get colArray(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get gridTemplate(): string {
    const cols = `repeat(${this.columns}, 1fr)`;
    return this.showActions ? `${cols} 100px` : cols;
  }
}
