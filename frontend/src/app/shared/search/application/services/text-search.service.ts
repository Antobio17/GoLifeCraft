import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class TextSearchService {
  normalize(value: string | null | undefined): string {
    if (!value) return "";

    return this.fold(value).replace(/[^a-z0-9]+/g, "");
  }

  tokens(query: string | null | undefined): string[] {
    if (!query) return [];

    return this.fold(query)
      .split(/[^a-z0-9]+/)
      .filter((token) => token !== "");
  }

  matches(
    query: string | null | undefined,
    ...values: (string | null | undefined)[]
  ): boolean {
    const tokens = this.tokens(query);

    if (tokens.length === 0) return true;

    const haystacks = values
      .map((value) => this.normalize(value))
      .filter((haystack) => haystack !== "");

    return tokens.every((token) =>
      haystacks.some((haystack) => haystack.includes(token)),
    );
  }

  private fold(value: string): string {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
}
