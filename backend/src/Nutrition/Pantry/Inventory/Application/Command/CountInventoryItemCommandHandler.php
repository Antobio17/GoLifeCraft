<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\CountInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Nutrition\Pantry\Inventory\Domain\QueryModel\CountInventoryItemNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CountInventoryItemCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private CountInventoryItemNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CountInventoryItemCommand $command): void
    {
        $inventory = $this->inventoryRepository->findByIdWithItem(
            id: $command->inventoryId,
            itemId: $command->itemId,
        );

        if (null === $inventory) {
            throw CountInventoryException::notFound(inventoryId: $command->inventoryId);
        }

        $inventory->countItem(
            itemId: $command->itemId,
            countedQuantity: $this->inBaseUnits(inventory: $inventory, command: $command),
            countedUnit: $command->countedUnit,
            countedByUserId: $command->countedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }

    private function inBaseUnits(Inventory $inventory, CountInventoryItemCommand $command): ?float
    {
        if (null === $command->countedQuantity) {
            return null;
        }

        if (null === $command->countedUnit || '' === $command->countedUnit) {
            return $command->countedQuantity;
        }

        $item = $inventory->item(itemId: $command->itemId);

        if (null === $item || $command->countedUnit === $item->unit) {
            return $command->countedQuantity;
        }

        $factor = $this->needleDataQuery->baseUnitFactor(articleId: $item->refId, unit: $command->countedUnit);

        return null === $factor ? $command->countedQuantity : $command->countedQuantity * $factor;
    }
}
