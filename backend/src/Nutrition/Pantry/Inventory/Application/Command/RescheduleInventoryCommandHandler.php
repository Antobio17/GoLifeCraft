<?php

namespace Nutrition\Pantry\Inventory\Application\Command;

use Nutrition\Pantry\Inventory\Domain\Exception\RescheduleInventoryException;
use Nutrition\Pantry\Inventory\Domain\Model\InventoryRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RescheduleInventoryCommandHandler
{
    public function __construct(
        private InventoryRepository $inventoryRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RescheduleInventoryCommand $command): void
    {
        $inventory = $this->inventoryRepository->findById(id: $command->inventoryId);

        if (null === $inventory) {
            throw RescheduleInventoryException::notFound(inventoryId: $command->inventoryId);
        }

        $inventory->reschedule(
            countedOn: $command->countedOn,
            shift: $command->shift,
            rescheduledByUserId: $command->rescheduledByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->inventoryRepository->save(inventory: $inventory);
        $this->domainEventCollectorService->register(aggregate: $inventory);
    }
}
