import { TestBed } from "@angular/core/testing";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { ARTICLE_ROUTES } from "../routes/article.routes";
import { TranslationProvider } from "@shared/i18n/infrastructure/providers/translation.provider";
import { FloatingToastService } from "@shared/floating-toasts/application/services/floating-toast.service";
import { AuthSessionProvider } from "@shared/auth/infrastructure/providers/auth-session.provider";
import { AggregateImageProviders } from "@shared/aggregate-image/infrastructure/providers/aggregate-image.providers";
import { ArticleEditorComponent } from "./article-editor.component";

describe("ArticleEditorComponent", () => {
  async function navigateTo(url: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: "catalog", children: ARTICLE_ROUTES }],
          withComponentInputBinding(),
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
        ...TranslationProvider.getProviders(),
        FloatingToastService,
        ...AuthSessionProvider.getProviders(),
        ...AggregateImageProviders.getProviders(),
      ],
    });

    const harness = await RouterTestingHarness.create();
    const component = (await harness.navigateByUrl(
      url,
    )) as ArticleEditorComponent;

    return { component, http: TestBed.inject(HttpTestingController) };
  }

  it("en /catalog/create abre el formulario de alta", async () => {
    const { component } = await navigateTo("/catalog/create");

    expect(component.isEdit).toBe(false);
  });

  it("en /catalog/:id/edit abre el formulario de edicion", async () => {
    const { component } = await navigateTo("/catalog/abc-123/edit");

    expect(component.isEdit).toBe(true);
    expect(component.id()).toBe("abc-123");
  });
});
