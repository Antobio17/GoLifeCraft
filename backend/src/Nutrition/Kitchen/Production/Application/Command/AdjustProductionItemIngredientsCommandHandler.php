<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\Service\ProductionCompositionResolver;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AdjustProductionItemIngredientsCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private ProductionCompositionResolver $compositionResolver,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AdjustProductionItemIngredientsCommand $command): void
    {
        $production = $this->productionRepository->findById(id: $command->productionId);
        if (null === $production) {
            throw AdjustProductionItemException::productionNotFound(productionId: $command->productionId);
        }

        $production->adjustItemIngredients(
            itemId: $command->itemId,
            composition: $this->compositionResolver->fromLines(lines: $command->ingredients),
            customized: true,
            adjustedByUserId: $command->adjustedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }
}
