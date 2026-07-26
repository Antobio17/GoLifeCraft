import { Routes } from "@angular/router";
import { GetAgendaProviders } from "../providers/get-agenda.providers";
import { AgendaWriteProviders } from "../providers/agenda-write.providers";

export const AGENDA_ROUTES: Routes = [
  {
    path: "",
    providers: [
      ...GetAgendaProviders.getProviders(),
      ...AgendaWriteProviders.getProviders(),
    ],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("../components/get-agenda.component").then(
            (m) => m.GetAgendaComponent,
          ),
      },
    ],
  },
];
