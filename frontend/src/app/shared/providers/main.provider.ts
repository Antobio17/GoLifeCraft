import { Provider } from "@angular/core";
import { FloatingToastProviders } from "@shared/floating-toasts/infrastructure/providers/floating-toast.providers";
import { TranslationProvider } from "@shared/i18n/infrastructure/providers/translation.provider";
import { AuthSessionProvider } from "@shared/auth/infrastructure/providers/auth-session.provider";
import { RefreshTokenProvider } from "@shared/auth/infrastructure/providers/refresh-token.provider";
import { ImpersonationProvider } from "@shared/auth/infrastructure/providers/impersonation.provider";
import { AggregateImageProviders } from "@shared/aggregate-image/infrastructure/providers/aggregate-image.providers";
import { VisualPreferenceProviders } from "@shared/visual-preference/infrastructure/providers/visual-preference.provider";
import { EntityVisualProviders } from "@shared/entity-visual/infrastructure/providers/entity-visual.providers";

export type ProviderModule = {
  getProviders(): Provider[];
};

export class GlobalProviders {
  private static providerModules: ProviderModule[] = [
    FloatingToastProviders,
    TranslationProvider,
    AuthSessionProvider,
    RefreshTokenProvider,
    ImpersonationProvider,
    AggregateImageProviders,
    VisualPreferenceProviders,
    EntityVisualProviders,
  ];

  static getProviders(): Provider[] {
    const providers: Provider[] = [];
    this.providerModules.forEach((module) => {
      providers.push(...module.getProviders());
    });
    return providers;
  }
}
