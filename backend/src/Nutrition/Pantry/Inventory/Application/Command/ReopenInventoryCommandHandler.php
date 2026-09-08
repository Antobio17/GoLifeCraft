<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\ReopenInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Nutrition\Pantry\Inventory\Domain\QueryModel\ReopenInventoryNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ReopenInventoryCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private ReopenInventoryNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ReopenInventoryCommand $command): void
    {
        $inventory = $this->inventoryRepository->findById(id: $command->inventoryId);

        if (null === $inventory) {
            throw ReopenInventoryException::notFound(inventoryId: $command->inventoryId);
        }

        $openInventoryId = $this->needleDataQuery->openInventoryId();

        if (null !== $openInventoryId) {
            throw ReopenInventoryException::anotherOneIsOpen(inventoryId: $openInventoryId);
        }

        $inventory->reopen(
            reopenedByUserId: $command->reopenedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }
}
