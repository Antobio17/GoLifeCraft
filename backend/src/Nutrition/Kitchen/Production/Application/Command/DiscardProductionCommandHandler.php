<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\DiscardProductionException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DiscardProductionCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DiscardProductionCommand $command): void
    {
        $production = $this->productionRepository->findById(id: $command->productionId);
        if (null === $production) {
            throw DiscardProductionException::productionNotFound(productionId: $command->productionId);
        }

        $production->discard(
            discardedByUserId: $command->discardedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->delete(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }
}
