<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\StartProductionException;
use Nutrition\Kitchen\Production\Domain\Model\Production;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\QueryModel\StartProductionNeedleDataQuery;
use Nutrition\Kitchen\Production\Domain\Service\ProductionCompositionResolver;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class StartProductionCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private StartProductionNeedleDataQuery $needleDataQuery,
        private ProductionCompositionResolver $compositionResolver,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(StartProductionCommand $command): void
    {
        $productionId = $this->productionRepository->nextId();

        $production = Production::start(
            id: $productionId,
            fromDate: $command->fromDate,
            toDate: $command->toDate,
            items: $this->planItems(productionId: $productionId, command: $command),
            startedByUserId: $command->startedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }

    /**
     * @return ProductionItem[]
     */
    private function planItems(string $productionId, StartProductionCommand $command): array
    {
        $items = [];
        $position = 0;

        foreach ($command->items as $item) {
            $recipeId = $item['recipeId'];

            if (isset($items[$recipeId])) {
                throw StartProductionException::duplicatedRecipe(recipeId: $recipeId);
            }

            $servings = (float) $item['servings'];
            if ($servings <= 0.0) {
                throw StartProductionException::servingsMustBePositive(servings: $servings);
            }

            $recipe = $this->needleDataQuery->findRecipeSnapshot(recipeId: $recipeId);
            if (null === $recipe) {
                throw StartProductionException::recipeNotFound(recipeId: $recipeId);
            }

            ++$position;

            $items[$recipeId] = ProductionItem::plan(
                productionId: $productionId,
                position: $position,
                recipeId: $recipeId,
                servingsPlanned: $servings,
                nameSnapshot: $recipe->name,
                emojiSnapshot: $recipe->emoji,
                composition: $this->compositionResolver->fromRecipe(recipeId: $recipeId, servings: $servings),
                createdByUserId: $command->startedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        return array_values(array: $items);
    }
}
