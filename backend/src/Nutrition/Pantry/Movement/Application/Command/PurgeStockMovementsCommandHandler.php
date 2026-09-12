<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class PurgeStockMovementsCommandHandler
{
    public function __construct(
        private StockMovementRepository $stockMovementRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(PurgeStockMovementsCommand $command): void
    {
        $movements = $this->stockMovementRepository->findAllByReference(
            kind: $command->kind,
            refId: $command->refId,
        );

        foreach ($movements as $movement) {
            $movement->revoke(
                revokedByUserId: $command->purgedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->stockMovementRepository->delete(stockMovement: $movement);
            $this->domainEventCollectorService->register(aggregate: $movement);
        }
    }
}
