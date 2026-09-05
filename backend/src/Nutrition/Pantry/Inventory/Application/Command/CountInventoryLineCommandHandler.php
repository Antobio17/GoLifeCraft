<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\CountInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CountInventoryLineCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CountInventoryLineCommand $command): void
    {
        $inventory = $this->inventoryRepository->findById(id: $command->inventoryId);

        if (null === $inventory) {
            throw CountInventoryException::notFound(inventoryId: $command->inventoryId);
        }

        $inventory->countLine(
            lineId: $command->lineId,
            countedQuantity: $command->countedQuantity,
            countedByUserId: $command->countedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }
}
