<?php

namespace Nutrition\Catalog\Supermarket\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\Supermarket\Domain\Event\SupermarketAislesUpdated;
use Nutrition\Catalog\Supermarket\Domain\Event\SupermarketCreated;
use Nutrition\Catalog\Supermarket\Domain\Exception\UpdateSupermarketAislesException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Supermarket extends GenericAggregate
{
    public string $name;

    /** @var SupermarketAisle[] */
    public array $aisles = [];

    public static function create(
        string $id,
        string $name,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $supermarket = new self();
        $supermarket->id = $id;
        $supermarket->name = $name;
        $supermarket->stampCreation(userId: $createdByUserId, now: $now);

        $supermarket->record(event: new SupermarketCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            aisles: [],
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $supermarket;
    }

    /**
     * @param SupermarketAisle[] $aisles
     */
    public function updateAisles(
        array $aisles,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $duplicatedName = self::findDuplicatedName(aisles: $aisles);
        if (null !== $duplicatedName) {
            throw UpdateSupermarketAislesException::aisleAlreadyExists(name: $duplicatedName);
        }

        $now = $dateTimeGenerator->now();

        $this->aisles = self::reposition(
            aisles: $aisles,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new SupermarketAislesUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            aisles: self::snapshotAll(aggregates: $this->aisles),
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    /**
     * @param SupermarketAisle[] $aisles
     *
     * @return SupermarketAisle[]
     */
    private static function reposition(
        array $aisles,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): array {
        $repositioned = [];

        foreach (array_values($aisles) as $index => $aisle) {
            $aisle->reposition(
                name: $aisle->name,
                position: $index + 1,
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            );
            $repositioned[] = $aisle;
        }

        return $repositioned;
    }

    /**
     * @param SupermarketAisle[] $aisles
     */
    private static function findDuplicatedName(array $aisles): ?string
    {
        $seen = [];

        foreach ($aisles as $aisle) {
            $key = mb_strtolower($aisle->name);
            if (isset($seen[$key])) {
                return $aisle->name;
            }

            $seen[$key] = true;
        }

        return null;
    }
}
