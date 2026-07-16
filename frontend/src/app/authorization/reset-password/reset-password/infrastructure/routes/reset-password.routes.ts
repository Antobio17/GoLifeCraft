import { Routes } from "@angular/router";
import { ResetPasswordProviders } from "../providers/reset-password.providers";

export const RESET_PASSWORD_ROUTES: Routes = [
  {
    path: "",
    providers: [...ResetPasswordProviders.getProviders()],
    loadComponent: () =>
      import("../components/reset-password.component").then(
        (m) => m.ResetPasswordComponent,
      ),
  },
];
