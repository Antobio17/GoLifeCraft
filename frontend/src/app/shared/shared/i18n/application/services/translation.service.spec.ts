import { TranslationService } from "./translation.service";
import { TranslationPort } from "../../domain/ports/translation.port";
import {
  SupportedLanguages,
  TranslationMap,
} from "../../domain/models/translation.model";
import { of, throwError } from "rxjs";

const mockTranslations: TranslationMap = {
  greeting: "Hello",
  nested: { key: "Nested Value" },
};

class MockTranslationPort extends TranslationPort {
  loadTranslations = jasmine
    .createSpy("loadTranslations")
    .and.returnValue(of(mockTranslations));
}

describe("TranslationService", () => {
  let service: TranslationService;
  let mockPort: MockTranslationPort;

  beforeEach(() => {
    localStorage.clear();
    mockPort = new MockTranslationPort();
    service = new TranslationService(mockPort);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("constructor", () => {
    it("should default to ES when localStorage has no language", () => {
      expect(service.getCurrentLanguage()).toBe(SupportedLanguages.ES);
    });

    it("should load language from localStorage when valid", () => {
      localStorage.setItem("app-language", SupportedLanguages.EN);
      const s = new TranslationService(mockPort);
      expect(s.getCurrentLanguage()).toBe(SupportedLanguages.EN);
    });

    it("should default to ES when localStorage has an invalid language", () => {
      localStorage.setItem("app-language", "invalid-lang");
      const s = new TranslationService(mockPort);
      expect(s.getCurrentLanguage()).toBe(SupportedLanguages.ES);
    });

    it("should persist ES to localStorage when no language was set", () => {
      expect(localStorage.getItem("app-language")).toBe(SupportedLanguages.ES);
    });
  });

  describe("setLanguage", () => {
    it("should update the current language", () => {
      service.setLanguage(SupportedLanguages.EN);
      expect(service.getCurrentLanguage()).toBe(SupportedLanguages.EN);
    });

    it("should persist the language in localStorage", () => {
      service.setLanguage(SupportedLanguages.EN);
      expect(localStorage.getItem("app-language")).toBe(SupportedLanguages.EN);
    });

    it("should clear the translation cache on language change", async () => {
      await service.loadModuleTranslations("auth/login");
      service.setLanguage(SupportedLanguages.EN);
      await service.loadModuleTranslations("auth/login");
      // Called twice because cache was cleared on language change
      expect(mockPort.loadTranslations).toHaveBeenCalledTimes(2);
    });
  });

  describe("loadModuleTranslations", () => {
    it("should call port.loadTranslations with the module path and language", async () => {
      await service.loadModuleTranslations("auth/login");
      expect(mockPort.loadTranslations).toHaveBeenCalledWith(
        "auth/login",
        SupportedLanguages.ES,
      );
    });

    it("should cache translations and not reload for the same module/language", async () => {
      await service.loadModuleTranslations("auth/login");
      await service.loadModuleTranslations("auth/login");
      expect(mockPort.loadTranslations).toHaveBeenCalledTimes(1);
    });

    it("should load translations separately for different modules", async () => {
      await service.loadModuleTranslations("auth/login");
      await service.loadModuleTranslations("auth/user");
      expect(mockPort.loadTranslations).toHaveBeenCalledTimes(2);
    });

    it("should resolve without error when port throws", async () => {
      mockPort.loadTranslations.and.returnValue(
        throwError(() => new Error("load error")),
      );
      await expectAsync(
        service.loadModuleTranslations("auth/login"),
      ).toBeResolved();
    });
  });

  describe("translate", () => {
    it("should return the key when the module has not been loaded", () => {
      expect(service.translate("greeting", "auth/login")).toBe("greeting");
    });

    it("should return the translation for a simple key after loading", async () => {
      await service.loadModuleTranslations("auth/login");
      expect(service.translate("greeting", "auth/login")).toBe("Hello");
    });

    it("should resolve nested keys using dot notation", async () => {
      await service.loadModuleTranslations("auth/login");
      expect(service.translate("nested.key", "auth/login")).toBe(
        "Nested Value",
      );
    });

    it("should return the key when translation is not found", async () => {
      await service.loadModuleTranslations("auth/login");
      expect(service.translate("missing.key", "auth/login")).toBe(
        "missing.key",
      );
    });

    it("should return the key for a partially valid nested path", async () => {
      await service.loadModuleTranslations("auth/login");
      expect(service.translate("nested.nonexistent", "auth/login")).toBe(
        "nested.nonexistent",
      );
    });
  });
});
