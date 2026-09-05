<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\ValidateInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ValidateInventoryCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ValidateInventoryCommand $command): void
    {
        $inventory = $this->inventoryRepository->findById(id: $command->inventoryId);

        if (null === $inventory) {
            throw ValidateInventoryException::notFound(inventoryId: $command->inventoryId);
        }

        $inventory->validate(
            validatedByUserId: $command->validatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }
}
