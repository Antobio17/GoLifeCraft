<?php

namespace Gamification\Achievement\Achievement\Application\Command;

use Gamification\Achievement\Achievement\Domain\Model\AchievementDefinition;
use Gamification\Achievement\Achievement\Domain\Service\AchievementCatalog;

final readonly class RecordAchievementProgressCommandFactory
{
    private const array ACTOR_FIELDS = ['updatedByUserId', 'finishedByUserId', 'createdByUserId'];

    public function __construct(
        private AchievementCatalog $achievementCatalog,
    ) {
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return RecordAchievementProgressCommand[]
     */
    public function forEvent(
        string $eventName,
        array $payload,
        string $occurredOn,
        bool $celebrate,
        ?string $fallbackUserId,
    ): array {
        $userId = self::actorOf(payload: $payload) ?? $fallbackUserId;

        if (null === $userId) {
            return [];
        }

        return array_map(
            callback: static fn (AchievementDefinition $definition): RecordAchievementProgressCommand => new RecordAchievementProgressCommand(
                definitionKey: $definition->key,
                occurredOn: $occurredOn,
                celebrate: $celebrate,
                recordedByUserId: $userId,
            ),
            array: $this->achievementCatalog->triggeredBy(eventName: $eventName, payload: $payload),
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    private static function actorOf(array $payload): ?string
    {
        foreach (self::ACTOR_FIELDS as $field) {
            $actor = $payload[$field] ?? null;

            if (is_string(value: $actor) && '' !== $actor) {
                return $actor;
            }
        }

        return null;
    }
}
