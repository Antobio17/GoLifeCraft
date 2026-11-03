<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Domain\Service\Configured;

use Gamification\Achievement\Achievement\Domain\Model\AchievementDefinition;
use Gamification\Achievement\Achievement\Domain\Model\AchievementMetric;
use Gamification\Achievement\Achievement\Domain\Model\AchievementTrigger;
use Gamification\Achievement\Achievement\Domain\Service\AchievementCatalog;

final readonly class ConfiguredAchievementCatalog implements AchievementCatalog
{
    /** @var array<string, AchievementDefinition> */
    private array $definitions;

    /**
     * @param array<int, array{key: string, module: string, icon: string, metric: string, min_per_period?: int, thresholds: int[], triggers: array<int, array{event: string, when?: array<string, scalar|null>}>}> $definitions
     */
    public function __construct(array $definitions)
    {
        $indexed = [];

        foreach ($definitions as $definition) {
            $achievement = self::definitionFrom(definition: $definition);

            if (isset($indexed[$achievement->key])) {
                throw new \InvalidArgumentException(message: sprintf('Achievement "%s" is declared twice.', $achievement->key));
            }

            $indexed[$achievement->key] = $achievement;
        }

        $this->definitions = $indexed;
    }

    public function all(): array
    {
        return array_values(array: $this->definitions);
    }

    public function find(string $key): ?AchievementDefinition
    {
        return $this->definitions[$key] ?? null;
    }

    public function triggeredBy(string $eventName, array $payload): array
    {
        return array_values(array: array_filter(
            array: $this->definitions,
            callback: static fn (AchievementDefinition $definition): bool => $definition->isTriggeredBy(
                eventName: $eventName,
                payload: $payload,
            ),
        ));
    }

    public function eventNames(): array
    {
        $eventNames = [];

        foreach ($this->definitions as $definition) {
            $eventNames = [...$eventNames, ...$definition->eventNames()];
        }

        return array_values(array: array_unique(array: $eventNames));
    }

    /**
     * @param array{key: string, module: string, icon: string, metric: string, min_per_period?: int, thresholds: int[], triggers: array<int, array{event: string, when?: array<string, scalar|null>}>} $definition
     */
    private static function definitionFrom(array $definition): AchievementDefinition
    {
        return new AchievementDefinition(
            key: (string) $definition['key'],
            module: (string) $definition['module'],
            icon: (string) $definition['icon'],
            metric: AchievementMetric::from(value: (string) $definition['metric']),
            minPerPeriod: (int) ($definition['min_per_period'] ?? 1),
            thresholds: array_map(callback: 'intval', array: array_values(array: $definition['thresholds'])),
            triggers: array_map(
                callback: static fn (array $trigger): AchievementTrigger => new AchievementTrigger(
                    eventName: (string) $trigger['event'],
                    conditions: $trigger['when'] ?? [],
                ),
                array: array_values(array: $definition['triggers']),
            ),
        );
    }
}
