import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { BrowserServiceWorkerRegistrationAdapter } from "./browser-service-worker-registration.adapter";

describe("BrowserServiceWorkerRegistrationAdapter", () => {
  function setUp(readyState: DocumentReadyState) {
    const register = jasmine
      .createSpy("register")
      .and.returnValue(Promise.resolve({}));
    const listeners: Record<string, () => void> = {};
    const view = {
      navigator: { serviceWorker: { register } },
      addEventListener: (type: string, listener: () => void) =>
        (listeners[type] = listener),
    };

    TestBed.configureTestingModule({
      providers: [
        BrowserServiceWorkerRegistrationAdapter,
        { provide: DOCUMENT, useValue: { readyState, defaultView: view } },
      ],
    });

    return {
      adapter: TestBed.inject(BrowserServiceWorkerRegistrationAdapter),
      register,
      listeners,
    };
  }

  it("registra el service worker en la raíz si la página ya cargó", () => {
    const { adapter, register } = setUp("complete");

    adapter.registerWhenLoaded();

    expect(register).toHaveBeenCalledOnceWith("/push-sw.js", { scope: "/" });
  });

  it("espera al evento load para no competir con la carga inicial", () => {
    const { adapter, register, listeners } = setUp("interactive");

    adapter.registerWhenLoaded();

    expect(register).not.toHaveBeenCalled();

    listeners["load"]();

    expect(register).toHaveBeenCalledOnceWith("/push-sw.js", { scope: "/" });
  });
});
