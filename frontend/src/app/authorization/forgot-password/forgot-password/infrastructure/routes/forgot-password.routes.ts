import { Routes } from "@angular/router";
import { ForgotPasswordProviders } from "../providers/forgot-password.providers";

export const FORGOT_PASSWORD_ROUTES: Routes = [
  {
    path: "",
    providers: [...ForgotPasswordProviders.getProviders()],
    loadComponent: () =>
      import("../components/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
];
