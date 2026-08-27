<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\QueryModel\StartProductionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class StartProductionCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private StartProductionNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(StartProductionCommand $command): void
    {
        $recipe = $this->needleDataQuery->findRecipeSnapshot(recipeId: $command->recipeId);
        if (null === $recipe) {
            throw StartProductionException::recipeNotFound(recipeId: $command->recipeId);
        }

        $production = Production::start(
            id: $this->productionRepository->nextId(),
            recipeId: $command->recipeId,
            cookDate: $command->cookDate,
            servingsPlanned: $command->servingsPlanned,
            nameSnapshot: $recipe->name,
            emojiSnapshot: $recipe->emoji,
            startedByUserId: $command->startedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }
}
