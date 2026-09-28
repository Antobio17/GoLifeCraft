export class PushPermissionDeniedError extends Error {
  constructor() {
    super("Push notification permission was not granted.");
    this.name = "PushPermissionDeniedError";
  }
}
