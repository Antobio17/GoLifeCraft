<?php

namespace Nutrition\Catalog\Supermarket\Application\Command;

use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketAisle;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketRepository;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SupermarketAisleAssembler
{
    public function __construct(
        private SupermarketRepository $supermarketRepository,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    /**
     * @param SupermarketAisleData[] $aisles
     *
     * @return SupermarketAisle[]
     */
    public function assemble(Supermarket $supermarket, array $aisles, string $userId): array
    {
        $existing = $this->indexById(aisles: $supermarket->aisles);

        return array_map(
            callback: fn (SupermarketAisleData $aisleData): SupermarketAisle => $this->assembleOne(
                supermarketId: $supermarket->id,
                aisleData: $aisleData,
                existing: null !== $aisleData->id ? ($existing[$aisleData->id] ?? null) : null,
                userId: $userId,
            ),
            array: $aisles,
        );
    }

    /**
     * @param SupermarketAisle[] $aisles
     *
     * @return array<string, SupermarketAisle>
     */
    private function indexById(array $aisles): array
    {
        $indexed = [];

        foreach ($aisles as $aisle) {
            $indexed[$aisle->id] = $aisle;
        }

        return $indexed;
    }

    private function assembleOne(
        string $supermarketId,
        SupermarketAisleData $aisleData,
        ?SupermarketAisle $existing,
        string $userId,
    ): SupermarketAisle {
        if (null === $existing) {
            return SupermarketAisle::create(
                id: $this->supermarketRepository->nextId(),
                supermarketId: $supermarketId,
                name: $aisleData->name,
                position: $aisleData->position,
                createdByUserId: $userId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        $existing->reposition(
            name: $aisleData->name,
            position: $aisleData->position,
            updatedByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $existing;
    }
}
