import { Component } from "@angular/core";

@Component({
  selector: "ds-dashboard-layout",
  standalone: true,
  template: `
    <div class="dash">
      <ng-content select="[slot='header']"></ng-content>
      <div class="dash__body">
        <div class="dash__main">
          <div class="dash__area dash__area--summary">
            <ng-content select="[slot='summary']"></ng-content>
          </div>
          <div class="dash__area dash__area--explore">
            <ng-content select="[slot='explore']"></ng-content>
          </div>
        </div>
        <div class="dash__area dash__area--gym">
          <ng-content select="[slot='gym']"></ng-content>
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
      .dash__main {
        display: contents;
      }
      .dash__area {
        min-width: 0;
      }
      .dash__area--summary {
        order: 0;
      }
      .dash__area--gym {
        order: 1;
      }
      .dash__area--explore {
        order: 2;
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
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
          align-items: start;
          column-gap: 24px;
        }
        .dash__main {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {}
