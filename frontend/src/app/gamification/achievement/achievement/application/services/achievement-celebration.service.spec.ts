import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";
import { AchievementCelebrationService } from "./achievement-celebration.service";
import { GetAchievementsPort } from "../../domain/ports/get-achievements.port";
import { MarkAchievementSeenPort } from "../../domain/ports/mark-achievement-seen.port";
import { Achievement } from "../../domain/models/achievement.model";
import { AchievementMetric } from "../../domain/models/achievement-metric.enum";
import { AchievementModule } from "../../domain/models/achievement-module.enum";
import { AchievementTier } from "../../domain/models/achievement-tier.enum";
import { CelebrationKind } from "../../domain/models/celebration-kind.enum";

describe("AchievementCelebrationService", () => {
  let achievements: Achievement[];
  let seen: string[];
  let fetches: number;
  let authenticated: boolean;
  let impersonating: boolean;
  let service: AchievementCelebrationService;

  const achievement = (
    key: string,
    unseenTiers: AchievementTier[],
  ): Achievement => ({
    key,
    module: AchievementModule.Gym,
    icon: "dumbbell",
    metric: AchievementMetric.Count,
    value: 60,
    progressValue: 60,
    activeStreak: 0,
    tiers: [
      {
        tier: AchievementTier.Bronze,
        threshold: 1,
        unlocked: true,
        unlockedAt: "x",
        seen: !unseenTiers.includes(AchievementTier.Bronze),
      },
      {
        tier: AchievementTier.Silver,
        threshold: 10,
        unlocked: true,
        unlockedAt: "x",
        seen: !unseenTiers.includes(AchievementTier.Silver),
      },
      {
        tier: AchievementTier.Gold,
        threshold: 50,
        unlocked: true,
        unlockedAt: "x",
        seen: !unseenTiers.includes(AchievementTier.Gold),
      },
      {
        tier: AchievementTier.Platinum,
        threshold: 100,
        unlocked: false,
        unlockedAt: null,
        seen: false,
      },
    ],
    currentTier: AchievementTier.Gold,
    nextTier: AchievementTier.Platinum,
    nextThreshold: 100,
    remaining: 40,
    progress: 0.6,
    unseenTiers,
    lastUnlockedAt: "x",
  });

  beforeEach(() => {
    achievements = [];
    seen = [];
    fetches = 0;
    authenticated = true;
    impersonating = false;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: GetAchievementsPort,
          useValue: {
            getAchievements: (): Observable<Achievement[]> => {
              fetches++;
              return of(achievements);
            },
          },
        },
        {
          provide: MarkAchievementSeenPort,
          useValue: {
            markSeen: (key: string): Observable<void> => {
              seen.push(key);
              return of(undefined);
            },
          },
        },
        {
          provide: AuthSessionService,
          useValue: { isAuthenticated: () => authenticated },
        },
        {
          provide: ImpersonationService,
          useValue: { isImpersonating: () => impersonating },
        },
        AchievementCelebrationService,
      ],
    });

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date("2026-11-03T12:00:00Z"));
    service = TestBed.inject(AchievementCelebrationService);
  });

  afterEach(() => jasmine.clock().uninstall());

  it("queues the highest unseen tier and celebrates gold on full screen", () => {
    achievements = [
      achievement("gym.workouts", [
        AchievementTier.Silver,
        AchievementTier.Gold,
      ]),
      achievement("nutrition.meals", []),
    ];

    service.requestCheck();
    jasmine.clock().tick(600);

    expect(service.current()?.key).toBe("gym.workouts");
    expect(service.current()?.tier).toBe(AchievementTier.Gold);
    expect(service.current()?.kind).toBe(CelebrationKind.FullScreen);
  });

  it("uses a toast for bronze and silver and marks it seen when dismissed", () => {
    achievements = [
      achievement("gym.workouts", [AchievementTier.Bronze]),
      achievement("agenda.tasks_done", [AchievementTier.Silver]),
    ];

    service.requestCheck();
    jasmine.clock().tick(600);

    expect(service.current()?.kind).toBe(CelebrationKind.Toast);

    service.dismiss("gym.workouts");

    expect(seen).toEqual(["gym.workouts"]);
    expect(service.current()?.key).toBe("agenda.tasks_done");
  });

  it("collapses a burst of mutations into a single check", () => {
    service.requestCheck();
    service.requestCheck();
    service.requestCheck();
    jasmine.clock().tick(600);

    expect(fetches).toBe(1);
  });

  it("does not check while signed out or impersonating", () => {
    authenticated = false;
    service.requestCheck();
    authenticated = true;
    impersonating = true;
    service.requestCheck();
    jasmine.clock().tick(600);

    expect(fetches).toBe(0);
  });

  it("ignores dismissing something that is not on screen", () => {
    achievements = [achievement("gym.workouts", [AchievementTier.Bronze])];

    service.requestCheck();
    jasmine.clock().tick(600);
    service.dismiss("nutrition.meals");

    expect(seen).toEqual([]);
    expect(service.current()?.key).toBe("gym.workouts");
  });
});
