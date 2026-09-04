<?php

namespace Integration\Mcp\Server\Domain\Model;

use Shared\Shared\Shared\Domain\Model\Aggregate;

abstract class GenericAggregate extends Aggregate
{
    public string $id;
    public \DateTime $createdAt;
    public \DateTime $updatedAt;
    public string $createdByUserId;
    public string $updatedByUserId;
    protected int $version;

    public function stampCreation(string $userId, \DateTime $now): void
    {
        $this->createdAt = $now;
        $this->createdByUserId = $userId;
        $this->stampUpdate(userId: $userId, now: $now);
    }

    public function stampUpdate(string $userId, \DateTime $now): void
    {
        $this->updatedAt = $now;
        $this->updatedByUserId = $userId;
    }

    public function snapshot(): array
    {
        $snapshot = [];

        foreach ((new \ReflectionObject(object: $this))->getProperties(filter: \ReflectionProperty::IS_PUBLIC) as $property) {
            if (!$property->isInitialized(object: $this)) {
                continue;
            }

            $snapshot[$property->getName()] = self::normalizeSnapshotValue(value: $property->getValue(object: $this));
        }

        return $snapshot;
    }

    /**
     * @param GenericAggregate[] $aggregates
     */
    public static function snapshotAll(array $aggregates): array
    {
        return array_values(array: array_map(
            callback: static fn (GenericAggregate $aggregate): array => $aggregate->snapshot(),
            array: $aggregates,
        ));
    }

    private static function normalizeSnapshotValue(mixed $value): mixed
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format(format: \DateTimeInterface::ATOM);
        }

        if ($value instanceof self) {
            return $value->snapshot();
        }

        if ($value instanceof \BackedEnum) {
            return $value->value;
        }

        if (!is_array($value)) {
            return $value;
        }

        return array_map(
            callback: static fn (mixed $item): mixed => self::normalizeSnapshotValue(value: $item),
            array: $value,
        );
    }
}
