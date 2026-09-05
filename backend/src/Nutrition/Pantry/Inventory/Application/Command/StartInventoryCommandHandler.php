<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\StartInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryLine;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
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

        if (null !== $command->locationId && !$this->needleDataQuery->locationExists(locationId: $command->locationId)) {
            throw StartInventoryException::locationNotFound(locationId: $command->locationId);
        }

        $inventoryId = $this->inventoryRepository->nextId();

        $inventory = Inventory::start(
            id: $inventoryId,
            countedOn: $command->countedOn,
            shift: $command->shift,
            locationId: $command->locationId,
            note: $command->note,
            lines: $this->planLines(inventoryId: $inventoryId, command: $command),
            startedByUserId: $command->startedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }

    /**
     * @return InventoryLine[]
     */
    private function planLines(string $inventoryId, StartInventoryCommand $command): array
    {
        $lines = [];
        $position = 0;

        foreach ($this->needleDataQuery->findStockLines(locationId: $command->locationId) as $stockLine) {
            ++$position;

            $lines[] = InventoryLine::plan(
                inventoryId: $inventoryId,
                position: $position,
                kind: $stockLine->kind,
                refId: $stockLine->refId,
                locationId: $stockLine->locationId,
                nameSnapshot: $stockLine->name,
                emojiSnapshot: $stockLine->emoji,
                unit: $stockLine->unit,
                expectedQuantity: $stockLine->quantity,
                createdByUserId: $command->startedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        return $lines;
    }
}
