import { FloatingToastService } from "./floating-toast.service";
import { FloatingToastMessage } from "../../domain/models/floating-toast.model";

describe("FloatingToastService", () => {
  let service: FloatingToastService;

  beforeEach(() => {
    service = new FloatingToastService();
  });

  it("should return null initially", () => {
    expect(service.getToast()()).toBeNull();
  });

  it("should update the toast signal when showToast is called", () => {
    const message: FloatingToastMessage = {
      status: 200,
      keyTranslation: "success",
      details: [],
    };

    service.showToast(message);

    expect(service.getToast()()).toEqual(message);
  });

  it("should reflect the latest toast when multiple messages are sent", () => {
    const toast1: FloatingToastMessage = {
      status: 200,
      keyTranslation: "ok",
      details: [],
    };
    const toast2: FloatingToastMessage = {
      status: 500,
      keyTranslation: "error",
      details: ["detail"],
    };

    service.showToast(toast1);
    expect(service.getToast()()).toEqual(toast1);

    service.showToast(toast2);
    expect(service.getToast()()).toEqual(toast2);
  });

  it("should return a readonly signal from getToast", () => {
    const toastSignal = service.getToast();
    expect(typeof toastSignal).toBe("function");
  });
});
