import { Component, Input } from "@angular/core";
import { GridComponent } from "../../../grid/infrastructure/components/grid.component";
import {
  SkeletonListItemComponent,
  SkeletonListItemTrailing,
} from "./skeleton-list-item.component";

@Component({
  selector: "ds-skeleton-list",
  imports: [GridComponent, SkeletonListItemComponent],
  template: `
    <ds-grid
      [minColumn]="minColumn"
      [gap]="gap"
      [columns]="columns"
      [tabletColumns]="tabletColumns"
    >
      @for (item of itemArray; track item; let i = $index) {
        <ds-skeleton-list-item
          [padding]="padding"
          [radius]="radius"
          [tone]="tone"
          [alignTop]="alignTop"
          [check]="check"
          [checkSize]="checkSize"
          [tile]="tile"
          [tileRadius]="tileRadius"
          [titleWidth]="titleWidth"
          [titleHeight]="titleHeight"
          [headTrailing]="headTrailing"
          [meta]="meta"
          [metaWidth]="metaWidth"
          [chips]="chips"
          [trailing]="trailing"
          [actions]="actions"
          [pillWidth]="pillWidth"
          [pillHeight]="pillHeight"
          [progress]="progress"
          [footButton]="footButton"
          [footItems]="footItems"
          [delay]="delayFor(i)"
        />
      }
    </ds-grid>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SkeletonListComponent {
  @Input() count = 4;
  @Input() gap = "var(--ds-space-2)";
  @Input() minColumn = "15rem";
  @Input() columns: number | null = 1;
  @Input() tabletColumns: number | null = null;

  @Input() padding = "var(--ds-space-2) var(--ds-space-3)";
  @Input() radius = "var(--ds-radius-xl)";
  @Input() tone: "surface" | "brand" = "surface";
  @Input() alignTop = false;
  @Input() check = false;
  @Input() checkSize = 26;
  @Input() tile = 0;
  @Input() tileRadius = 12;
  @Input() titleWidth = "58%";
  @Input() titleHeight = "0.8125rem";
  @Input() headTrailing = "";
  @Input() meta = true;
  @Input() metaWidth = "38%";
  @Input() chips = 0;
  @Input() trailing: SkeletonListItemTrailing = "none";
  @Input() actions = 2;
  @Input() pillWidth = "4.875rem";
  @Input() pillHeight = "1.875rem";
  @Input() progress = false;
  @Input() footButton = false;
  @Input() footItems = 0;

  get itemArray(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }

  delayFor(index: number): string {
    return `${index * 0.08}s`;
  }
}
