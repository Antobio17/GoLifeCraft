<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\StartInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocation;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLocationItem;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Nutrition\Pantry\Inventory\Domain\QueryModel\Dto\InventoryLocationPlan;
use Nutrition\Pantry\Inventory\Domain\QueryModel\StartInventoryNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class StartInventoryCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private StartInventoryNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(StartInventoryCommand $command): void
    {
        $openInventoryId = $this->needleDataQuery->openInventoryId();

        if (null !== $openInventoryId) {
            throw StartInventoryException::alreadyOpen(inventoryId: $openInventoryId);
        }

        $inventoryId = $this->inventoryRepository->nextId();

        $inventory = Inventory::start(
            id: $inventoryId,
            countedOn: $command->countedOn,
            shift: $command->shift,
            note: $command->note,
            locations: $this->planLocations(inventoryId: $inventoryId, command: $command),
            startedByUserId: $command->startedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }

    /**
     * @return InventoryLocation[]
     */
    private function planLocations(string $inventoryId, StartInventoryCommand $command): array
    {
        $locations = [];
        $position = 0;

        foreach ($this->needleDataQuery->findLocationPlans() as $plan) {
            if ([] === $plan->items) {
                continue;
            }

            ++$position;

            $location = InventoryLocation::plan(
                inventoryId: $inventoryId,
                position: $position,
                locationId: $plan->locationId,
                nameSnapshot: $plan->name,
                emojiSnapshot: $plan->emoji,
                createdByUserId: $command->startedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $location->items = $this->planItems(
                inventoryId: $inventoryId,
                inventoryLocationId: $location->id,
                plan: $plan,
                command: $command,
            );

            $locations[] = $location;
        }

        return $locations;
    }

    /**
     * @return InventoryLocationItem[]
     */
    private function planItems(
        string $inventoryId,
        string $inventoryLocationId,
        InventoryLocationPlan $plan,
        StartInventoryCommand $command,
    ): array {
        $items = [];
        $position = 0;

        foreach ($plan->items as $stockLine) {
            ++$position;

            $items[] = InventoryLocationItem::plan(
                inventoryId: $inventoryId,
                inventoryLocationId: $inventoryLocationId,
                position: $position,
                kind: $stockLine->kind,
                refId: $stockLine->refId,
                nameSnapshot: $stockLine->name,
                emojiSnapshot: $stockLine->emoji,
                unit: $stockLine->unit,
                expectedQuantity: $stockLine->quantity,
                createdByUserId: $command->startedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        return $items;
    }
}
