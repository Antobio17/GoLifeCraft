import { Component } from "@angular/core";

@Component({
  selector: "ds-dashboard-layout",
  template: `
    <div class="dash">
      <ng-content select="[slot='header']"></ng-content>
      <div class="dash__body">
        <div class="dash__main">
          <div class="dash__area dash__area--summary">
            <ng-content select="[slot='summary']"></ng-content>
          </div>
          <div class="dash__area dash__area--agenda">
            <ng-content select="[slot='agenda']"></ng-content>
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
        padding: calc(env(safe-area-inset-top) + 0.625rem) 1.375rem 0;
      }
      .dash__body {
        display: flex;
        flex-direction: column;
        gap: 0.8125rem;
        padding: 0.875rem 0 1.25rem;
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
      .dash__area--agenda {
        order: 1;
      }
      .dash__area--gym {
        order: 2;
      }
      .dash__area--explore {
        order: 3;
      }
      @media (min-width: 768px) {
        .dash {
          max-width: var(--ds-app-content-max);
          padding: 1.875rem 2.5rem 0;
        }
        .dash__body {
          gap: 1.125rem;
          padding: 1.375rem 0 2.25rem;
        }
      }
      @media (min-width: 1000px) {
        .dash__body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
          align-items: start;
          column-gap: 1.5rem;
        }
        .dash__main {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {}
