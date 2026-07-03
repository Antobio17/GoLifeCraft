// Zone.js is required by Angular
import "zone.js";

if (!("getOrInsertComputed" in Map.prototype)) {
  (Map.prototype as unknown as Record<string, unknown>)["getOrInsertComputed"] =
    function <K, V>(this: Map<K, V>, key: K, computeFn: (key: K) => V): V {
      if (!this.has(key)) {
        this.set(key, computeFn(key));
      }
      return this.get(key)!;
    };
}

if (!("try" in Promise)) {
  (Promise as unknown as Record<string, unknown>)["try"] = function <T>(
    fn: () => T | PromiseLike<T>,
  ): Promise<T> {
    return new Promise<T>((resolve) => resolve(fn()));
  };
}
