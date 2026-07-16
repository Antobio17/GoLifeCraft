import { Routes } from "@angular/router";
import { VerifyEmailProviders } from "../providers/verify-email.providers";

export const VERIFY_EMAIL_ROUTES: Routes = [
  {
    path: "",
    providers: [...VerifyEmailProviders.getProviders()],
    loadComponent: () =>
      import("../components/verify-email.component").then(
        (m) => m.VerifyEmailComponent,
      ),
  },
];
