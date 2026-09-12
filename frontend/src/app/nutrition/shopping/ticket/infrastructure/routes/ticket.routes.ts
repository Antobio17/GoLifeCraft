import { Routes } from "@angular/router";
import { GetTicketsProviders } from "../providers/get-tickets.providers";
import { GetTicketProviders } from "../providers/get-ticket.providers";
import { LinkTicketItemProviders } from "../providers/link-ticket-item.providers";
import { UnlinkTicketItemProviders } from "../providers/unlink-ticket-item.providers";
import { RemoveTicketItemProviders } from "../providers/remove-ticket-item.providers";
import { UpdateTicketItemProviders } from "../providers/update-ticket-item.providers";
import { ReceiveTicketProviders } from "../providers/receive-ticket.providers";
import { UnreceiveTicketProviders } from "../providers/unreceive-ticket.providers";
import { DeleteTicketProviders } from "../providers/delete-ticket.providers";
import { GetArticlesProviders } from "@nutrition/catalog/article/infrastructure/providers/get-articles.providers";
import { GetSupermarketsProviders } from "@nutrition/catalog/supermarket/infrastructure/providers/get-supermarkets.providers";
import { GetTicketDraftProviders } from "../providers/get-ticket-draft.providers";
import { CreateTicketProviders } from "../providers/create-ticket.providers";

export const TICKET_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetTicketsProviders.getProviders(),
      ...GetTicketProviders.getProviders(),
      ...LinkTicketItemProviders.getProviders(),
      ...UnlinkTicketItemProviders.getProviders(),
      ...RemoveTicketItemProviders.getProviders(),
      ...UpdateTicketItemProviders.getProviders(),
      ...ReceiveTicketProviders.getProviders(),
      ...UnreceiveTicketProviders.getProviders(),
      ...DeleteTicketProviders.getProviders(),
      ...GetArticlesProviders.getProviders(),
      ...GetSupermarketsProviders.getProviders(),
      ...GetTicketDraftProviders.getProviders(),
      ...CreateTicketProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-tickets.component").then(
            (m) => m.GetTicketsComponent,
          ),
      },
      {
        path: "scan",
        data: { breadcrumb: "ticket.breadcrumb.scan" },
        loadComponent: () =>
          import("../components/scan-ticket.component").then(
            (m) => m.ScanTicketComponent,
          ),
      },
      {
        path: ":id",
        data: { breadcrumb: "ticket.breadcrumb.detail" },
        loadComponent: () =>
          import("../components/get-ticket.component").then(
            (m) => m.GetTicketComponent,
          ),
      },
    ],
  },
];
