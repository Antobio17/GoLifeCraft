// Zone.js is required by Angular
import "zone.js";

if (!("getOrInsertComputed" in Map.prototype)) {
  (Map.prototype as any).getOrInsertComputed = function <K, V>(
    key: K,
    computeFn: (key: K) => V,
  ): V {
    if (!this.has(key)) {
      this.set(key, computeFn(key));
    }
    return this.get(key);
  };
}

if (!("try" in Promise)) {
  (Promise as any).try = function <T>(
    fn: () => T | PromiseLike<T>,
  ): Promise<T> {
    return new Promise<T>((resolve) => resolve(fn()));
  };
}
