<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\DiscardInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DiscardInventoryCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DiscardInventoryCommand $command): void
    {
        $inventory = $this->inventoryRepository->findById(id: $command->inventoryId);

        if (null === $inventory) {
            throw DiscardInventoryException::notFound(inventoryId: $command->inventoryId);
        }

        $inventory->discard(
            discardedByUserId: $command->discardedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->delete(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }
}
