import { Routes } from "@angular/router";
import { GetDomainEventLogsProvider } from "../providers/get-domain-event-logs.provider";
import { GetDomainEventLogProvider } from "../providers/get-domain-event-log.provider";

export const DOMAIN_EVENT_LOG_ROUTES: Routes = [
  {
    path: "",
    providers: [...GetDomainEventLogsProvider.getProviders()],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/domain-event-log.component").then(
            (m) => m.DomainEventLogComponent,
          ),
      },
    ],
  },
  {
    path: ":id",
    data: { breadcrumb: null },
    providers: [...GetDomainEventLogProvider.getProviders()],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/domain-event-log-detail.component").then(
            (m) => m.DomainEventLogDetailComponent,
          ),
        data: { breadcrumb: "domainEventLog.breadcrumb.detail" },
      },
    ],
  },
];
