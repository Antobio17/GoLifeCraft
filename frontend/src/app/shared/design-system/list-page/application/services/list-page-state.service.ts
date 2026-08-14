import { Injectable } from "@angular/core";
import { ListPageSnapshot } from "../../domain/models/list-page-snapshot.model";

@Injectable({ providedIn: "root" })
export class ListPageStateService {
  private readonly snapshots = new Map<string, ListPageSnapshot<unknown>>();

  save<T>(key: string, snapshot: ListPageSnapshot<T>): void {
    this.snapshots.set(key, snapshot as ListPageSnapshot<unknown>);
  }

  take<T>(key: string): ListPageSnapshot<T> | null {
    const snapshot = this.snapshots.get(key);

    if (undefined === snapshot) return null;

    this.snapshots.delete(key);

    return snapshot as ListPageSnapshot<T>;
  }
}
