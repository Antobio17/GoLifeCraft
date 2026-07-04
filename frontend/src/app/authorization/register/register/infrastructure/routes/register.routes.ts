import { Routes } from "@angular/router";
import { RegisterProviders } from "../providers/register.providers";

export const REGISTER_ROUTES: Routes = [
  {
    path: "",
    providers: [...RegisterProviders.getProviders()],
    loadComponent: () =>
      import("../components/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
];
