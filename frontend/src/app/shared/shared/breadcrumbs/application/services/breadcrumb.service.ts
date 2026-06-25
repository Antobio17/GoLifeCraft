import { Injectable, signal } from "@angular/core";

export interface FolderBreadcrumb {
  id: string;
  name: string;
}

@Injectable({ providedIn: "root" })
export class BreadcrumbService {
  private _folderBreadcrumbs = signal<FolderBreadcrumb[]>([]);
  readonly folderBreadcrumbs = this._folderBreadcrumbs.asReadonly();

  private _dynamicLastLabel = signal<string | null>(null);
  readonly dynamicLastLabel = this._dynamicLastLabel.asReadonly();

  private _hidden = signal<boolean>(false);
  readonly hidden = this._hidden.asReadonly();

  hide(): void {
    this._hidden.set(true);
  }

  show(): void {
    this._hidden.set(false);
  }

  push(item: FolderBreadcrumb): void {
    this._folderBreadcrumbs.update((items) => [...items, item]);
  }

  trimTo(index: number): void {
    this._folderBreadcrumbs.update((items) => items.slice(0, index + 1));
  }

  clear(): void {
    this._folderBreadcrumbs.set([]);
  }

  setDynamicLastLabel(label: string): void {
    this._dynamicLastLabel.set(label);
  }

  clearDynamicLastLabel(): void {
    this._dynamicLastLabel.set(null);
  }
}
