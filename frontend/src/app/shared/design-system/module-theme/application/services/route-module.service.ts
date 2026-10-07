import { Injectable } from "@angular/core";
import { AppModule } from "../../domain/models/app-module.enum";

@Injectable({ providedIn: "root" })
export class RouteModuleService {
  private readonly prefixes: ReadonlyArray<[string, AppModule]> = [
    ["/gym", AppModule.Gym],
    ["/economy", AppModule.Finance],
    ["/agenda", AppModule.Agenda],
  ];

  moduleFor(url: string): AppModule | null {
    const match = this.prefixes.find(([prefix]) => url.startsWith(prefix));

    return match ? match[1] : null;
  }

  navModuleFor(url: string): AppModule | null {
    if (url.startsWith("/dashboard")) return AppModule.Home;

    return this.moduleFor(url);
  }
}
