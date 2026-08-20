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
        <div class="dash__aside">
          <div class="dash__area dash__area--gym">
            <ng-content select="[slot='gym']"></ng-content>
          </div>
          <div class="dash__area dash__area--balance">
            <ng-content select="[slot='balance']"></ng-content>
          </div>
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
        padding: var(--ds-space-2) var(--ds-space-5) 0;
      }
      .dash__body {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-3);
        padding: var(--ds-space-3) 0 var(--ds-space-5);
      }
      .dash__main,
      .dash__aside {
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
      .dash__area--balance {
        order: 2;
      }
      .dash__area--gym {
        order: 3;
      }
      .dash__area--explore {
        order: 4;
      }
      @media (min-width: 768px) {
        .dash {
          max-width: var(--ds-app-content-max);
          padding: var(--ds-space-8) 2.5rem 0;
        }
        .dash__body {
          gap: var(--ds-space-4);
          padding: var(--ds-space-5) 0 2.25rem;
        }
      }
      @media (min-width: 1000px) {
        .dash__body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: start;
          column-gap: var(--ds-space-6);
        }
        .dash__main,
        .dash__aside {
          display: flex;
          flex-direction: column;
          gap: var(--ds-space-4);
        }
        .dash__area--gym {
          order: 0;
        }
        .dash__area--balance {
          order: 1;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {}
