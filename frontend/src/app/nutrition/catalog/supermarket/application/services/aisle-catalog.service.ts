import { Injectable } from "@angular/core";
import { Supermarket } from "../../domain/models/supermarket.model";
import { SupermarketAisle } from "../../domain/models/supermarket-aisle.model";
import { UpdateSupermarketAisleRequest } from "../../domain/models/update-supermarket-aisle.model";

@Injectable()
export class AisleCatalogService {
  private static readonly DRAFT_PREFIX = "draft-";

  aislesOf(supermarket: Supermarket | undefined): SupermarketAisle[] {
    if (!supermarket) return [];

    return [...(supermarket.attributes.aisles ?? [])].sort(
      (left, right) => left.position - right.position,
    );
  }

  findById(
    supermarkets: Supermarket[],
    supermarketId: string | null,
  ): Supermarket | undefined {
    if (!supermarketId) return undefined;

    return supermarkets.find((supermarket) => supermarket.id === supermarketId);
  }

  add(aisles: SupermarketAisle[], name: string): SupermarketAisle[] | null {
    const trimmed = name.trim();
    if ("" === trimmed) return null;

    if (this.contains(aisles, trimmed)) return null;

    return this.reposition([
      ...aisles,
      {
        id: `${AisleCatalogService.DRAFT_PREFIX}${aisles.length}-${Date.now()}`,
        name: trimmed,
        position: aisles.length + 1,
      },
    ]);
  }

  rename(
    aisles: SupermarketAisle[],
    aisleId: string,
    name: string,
  ): SupermarketAisle[] | null {
    const trimmed = name.trim();
    if ("" === trimmed) return null;

    const others = aisles.filter((aisle) => aisle.id !== aisleId);
    if (this.contains(others, trimmed)) return null;

    return aisles.map((aisle) =>
      aisle.id === aisleId ? { ...aisle, name: trimmed } : aisle,
    );
  }

  remove(aisles: SupermarketAisle[], aisleId: string): SupermarketAisle[] {
    return this.reposition(aisles.filter((aisle) => aisle.id !== aisleId));
  }

  move(
    aisles: SupermarketAisle[],
    from: number,
    to: number,
  ): SupermarketAisle[] {
    if (from === to) return aisles;
    if (from < 0 || to < 0) return aisles;
    if (from >= aisles.length || to >= aisles.length) return aisles;

    const moved = [...aisles];
    const [aisle] = moved.splice(from, 1);
    moved.splice(to, 0, aisle);

    return this.reposition(moved);
  }

  contains(aisles: SupermarketAisle[], name: string): boolean {
    const normalized = name.trim().toLocaleLowerCase("es");

    return aisles.some(
      (aisle) => aisle.name.toLocaleLowerCase("es") === normalized,
    );
  }

  toRequest(aisles: SupermarketAisle[]): UpdateSupermarketAisleRequest[] {
    return aisles.map((aisle) => ({
      id: this.isDraft(aisle) ? null : aisle.id,
      name: aisle.name,
    }));
  }

  private isDraft(aisle: SupermarketAisle): boolean {
    return aisle.id.startsWith(AisleCatalogService.DRAFT_PREFIX);
  }

  private reposition(aisles: SupermarketAisle[]): SupermarketAisle[] {
    return aisles.map((aisle, index) => ({ ...aisle, position: index + 1 }));
  }
}
