import { Routes } from "@angular/router";
import { LoginProviders } from "../providers/login.providers";

export const LOGIN_ROUTES: Routes = [
  {
    path: "",
    providers: [...LoginProviders.getProviders()],
    loadComponent: () =>
      import("../components/login.component").then((m) => m.LoginComponent),
  },
];
