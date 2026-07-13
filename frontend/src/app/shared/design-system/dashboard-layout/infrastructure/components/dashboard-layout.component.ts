import { Component } from "@angular/core";

@Component({
  selector: "ds-dashboard-layout",
  standalone: true,
  template: `
    <div class="dash">
      <ng-content select="[slot='header']"></ng-content>
      <div class="dash__body">
        <div class="dash__area dash__area--summary">
          <ng-content select="[slot='summary']"></ng-content>
        </div>
        <div class="dash__area dash__area--gym">
          <ng-content select="[slot='gym']"></ng-content>
        </div>
        <div class="dash__area dash__area--explore">
          <ng-content select="[slot='explore']"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .dash {
        display: flex;
        flex-direction: column;
        padding: calc(env(safe-area-inset-top) + 10px) 22px 0;
      }
      .dash__body {
        display: flex;
        flex-direction: column;
        gap: 13px;
        padding: 14px 0 20px;
      }
      .dash__area {
        min-width: 0;
      }
      @media (min-width: 768px) {
        .dash {
          max-width: var(--ds-app-content-max);
          padding: 30px 40px 0;
        }
        .dash__body {
          gap: 18px;
          padding: 22px 0 36px;
        }
      }
      @media (min-width: 1000px) {
        .dash__body {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          grid-template-areas:
            "summary explore"
            "gym explore";
          align-items: start;
          column-gap: 24px;
          row-gap: 16px;
        }
        .dash__area--summary {
          grid-area: summary;
        }
        .dash__area--gym {
          grid-area: gym;
        }
        .dash__area--explore {
          grid-area: explore;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {}
