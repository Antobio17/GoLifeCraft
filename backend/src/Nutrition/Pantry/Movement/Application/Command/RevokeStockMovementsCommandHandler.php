<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RevokeStockMovementsCommandHandler
{
    public function __construct(
        private StockMovementRepository $stockMovementRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RevokeStockMovementsCommand $command): void
    {
        $movements = $this->stockMovementRepository->findAllBySource(
            sourceKind: $command->sourceKind,
            sourceId: $command->sourceId,
        );

        foreach ($movements as $movement) {
            $movement->revoke(
                revokedByUserId: $command->revokedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->stockMovementRepository->delete(stockMovement: $movement);
            $this->domainEventCollectorService->register(aggregate: $movement);
        }
    }
}
