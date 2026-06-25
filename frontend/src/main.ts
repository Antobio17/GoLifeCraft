import {
  provideZoneChangeDetection,
  importProvidersFrom,
  LOCALE_ID,
} from "@angular/core";
import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
registerLocaleData(localeEs);
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { authTokenInterceptor } from "./app/shared/auth/infrastructure/interceptors/auth-token.interceptor";
import { httpErrorInterceptor } from "./app/shared/auth/infrastructure/interceptors/http-error.interceptor";
import { bootstrapApplication } from "@angular/platform-browser";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { MainLayoutComponent } from "./app/layouts/layout/main/infrastructure/components/main.component";
import { APP_ROUTES } from "./app/app.routes";
import { GlobalProviders } from "@shared/shared/shared/infrastructure/providers/main.provider";
import { ThemeProvider } from "@shared/shared/theme/infrastructure/providers/theme.provider";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

bootstrapApplication(MainLayoutComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(ReactiveFormsModule, FormsModule),
    provideRouter(
      APP_ROUTES,
      withInMemoryScrolling({
        anchorScrolling: "enabled",
        scrollPositionRestoration: "enabled",
      }),
    ),
    provideHttpClient(
      withInterceptors([authTokenInterceptor, httpErrorInterceptor]),
    ),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: "es" },
    ...GlobalProviders.getProviders(),
    ...ThemeProvider.getProviders(),
  ],
}).catch((err) => console.error(err));
