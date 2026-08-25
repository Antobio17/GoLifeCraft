import { Component } from "@angular/core";
import { SplitViewComponent } from "@shared/design-system/split-view/infrastructure/components/split-view.component";
import { StackComponent } from "@shared/design-system/stack/infrastructure/components/stack.component";
import { SkeletonComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton.component";
import { SkeletonLineComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-line.component";
import { SkeletonChipsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-chips.component";
import { SkeletonFieldsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-fields.component";
import { SkeletonRowsComponent } from "@shared/design-system/skeleton/infrastructure/components/skeleton-rows.component";

@Component({
  selector: "app-article-form-skeleton",
  imports: [
    SplitViewComponent,
    StackComponent,
    SkeletonComponent,
    SkeletonLineComponent,
    SkeletonChipsComponent,
    SkeletonFieldsComponent,
    SkeletonRowsComponent,
  ],
  template: `
    <ds-split-view
      [gap]="'var(--ds-space-5)'"
      [columns]="'minmax(0, 1fr) minmax(0, 1fr)'"
    >
      <ds-stack slot="side" [gap]="'var(--ds-space-5)'">
        <ds-stack direction="row" align="end" [gap]="'var(--ds-space-3)'">
          <ds-stack [gap]="'var(--ds-space-2)'">
            <ds-skeleton-line width="3.25rem" height="0.6875rem" />
            <ds-skeleton
              width="4.5rem"
              height="4.5rem"
              radius="var(--ds-radius-xl)"
            />
          </ds-stack>
          <ds-stack [grow]="true" [gap]="'var(--ds-space-2)'">
            <ds-skeleton-line width="4.5rem" height="0.6875rem" />
            <ds-skeleton height="3rem" radius="var(--ds-radius-lg)" />
          </ds-stack>
        </ds-stack>

        <ds-skeleton-fields
          [rows]="[2]"
          controlHeight="3rem"
          [gap]="'var(--ds-space-5)'"
        />

        <ds-stack [gap]="'var(--ds-space-2)'">
          <ds-skeleton-line width="5.5rem" height="0.6875rem" />
          <ds-skeleton-chips
            [count]="9"
            [wrap]="true"
            height="2.5rem"
            [widths]="[
              '5.5rem',
              '6.25rem',
              '5rem',
              '6rem',
              '6.5rem',
              '5.75rem',
              '8.5rem',
              '10rem',
              '7rem',
            ]"
          />
        </ds-stack>

        <ds-stack [gap]="'var(--ds-space-2)'">
          <ds-skeleton-line width="3.5rem" height="0.6875rem" />
          <ds-skeleton-chips
            [count]="3"
            height="2.5rem"
            [widths]="['7.5rem', '7rem', '4.5rem']"
          />
        </ds-stack>
      </ds-stack>

      <ds-skeleton-rows
        [card]="true"
        [header]="true"
        [badge]="true"
        [rows]="7"
        valueWidth="4.625rem"
      />
      <ds-skeleton-rows
        [card]="true"
        [header]="true"
        [rows]="3"
        labelWidth="38%"
        valueWidth="6.75rem"
      />
      <ds-skeleton height="2.875rem" radius="var(--ds-radius-lg)" />
    </ds-split-view>
  `,
})
export class ArticleFormSkeletonComponent {}
