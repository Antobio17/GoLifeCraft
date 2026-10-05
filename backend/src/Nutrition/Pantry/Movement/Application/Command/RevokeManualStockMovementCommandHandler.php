<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Domain\Exception\StockMovementException;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RevokeManualStockMovementCommandHandler
{
    public function __construct(
        private StockMovementRepository $stockMovementRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RevokeManualStockMovementCommand $command): void
    {
        $movement = $this->stockMovementRepository->findById(id: $command->movementId);

        if (null === $movement) {
            throw StockMovementException::notFound(movementId: $command->movementId);
        }

        $movement->revokeByHand(
            revokedByUserId: $command->revokedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->stockMovementRepository->delete(stockMovement: $movement);
        $this->domainEventCollectorService->register(aggregate: $movement);
    }
}
