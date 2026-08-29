<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\QueryModel\CookProductionItemNeedleDataQuery;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionSubRecipe;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CookProductionItemCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private CookProductionItemNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CookProductionItemCommand $command): void
    {
        $production = $this->productionRepository->findById(id: $command->productionId);
        if (null === $production) {
            throw CookProductionItemException::productionNotFound(productionId: $command->productionId);
        }

        $item = $production->item(itemId: $command->itemId);
        if (null === $item) {
            throw CookProductionItemException::itemNotFound(
                productionId: $command->productionId,
                itemId: $command->itemId,
            );
        }

        $needs = $this->needleDataQuery->resolveNeeds(
            recipeId: $item->recipeId,
            servings: $command->servingsCooked,
        );

        $production->cookItem(
            itemId: $command->itemId,
            servingsCooked: $command->servingsCooked,
            consumedArticles: array_map(
                callback: static fn (ProductionIngredient $ingredient): array => [
                    'articleId' => $ingredient->articleId,
                    'quantity' => $ingredient->baseQuantity,
                    'unit' => $ingredient->baseUnit,
                ],
                array: $needs->articles,
            ),
            consumedRecipes: array_map(
                callback: static fn (ProductionSubRecipe $subRecipe): array => [
                    'recipeId' => $subRecipe->recipeId,
                    'servings' => $subRecipe->servings,
                ],
                array: $needs->subRecipes,
            ),
            cookedByUserId: $command->cookedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }
}
