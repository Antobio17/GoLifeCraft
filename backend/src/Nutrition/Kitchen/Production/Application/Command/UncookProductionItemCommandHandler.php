<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UncookProductionItemCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private FinishProductionNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UncookProductionItemCommand $command): void
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

        $needs = $this->needsOf(recipeId: $item->recipeId, servings: $item->servingsCooked);

        $production->uncookItem(
            itemId: $command->itemId,
            consumedArticles: $needs['articles'],
            consumedRecipes: $needs['recipes'],
            uncookedByUserId: $command->uncookedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }

    /**
     * Resolved the same way cooking resolved it, so what goes back is what was taken out.
     *
     * @return array{articles: array<int, array{articleId: string, quantity: float, unit: string}>, recipes: array<int, array{recipeId: string, servings: float}>}
     */
    private function needsOf(string $recipeId, float $servings): array
    {
        $needs = $this->needleDataQuery->resolveNeeds(recipeId: $recipeId, servings: $servings);
        $articles = [];

        foreach ($needs->articles as $ingredient) {
            $articles[] = [
                'articleId' => $ingredient->articleId,
                'quantity' => $ingredient->baseQuantity,
                'unit' => $ingredient->baseUnit,
            ];
        }

        $recipes = [];

        foreach ($needs->subRecipes as $subRecipe) {
            $recipes[] = ['recipeId' => $subRecipe->recipeId, 'servings' => $subRecipe->servings];
        }

        return [
            'articles' => $this->mergeByArticle(consumed: $articles),
            'recipes' => $this->mergeByRecipe(consumed: $recipes),
        ];
    }

    /**
     * @param array<int, array{articleId: string, quantity: float, unit: string}> $consumed
     *
     * @return array<int, array{articleId: string, quantity: float, unit: string}>
     */
    private function mergeByArticle(array $consumed): array
    {
        $merged = [];

        foreach ($consumed as $item) {
            $articleId = $item['articleId'];

            if (!isset($merged[$articleId])) {
                $merged[$articleId] = $item;

                continue;
            }

            $merged[$articleId]['quantity'] = round(
                num: $merged[$articleId]['quantity'] + $item['quantity'],
                precision: ProductionIngredient::QUANTITY_PRECISION,
            );
        }

        return array_values(array: $merged);
    }

    /**
     * @param array<int, array{recipeId: string, servings: float}> $consumed
     *
     * @return array<int, array{recipeId: string, servings: float}>
     */
    private function mergeByRecipe(array $consumed): array
    {
        $merged = [];

        foreach ($consumed as $item) {
            $recipeId = $item['recipeId'];

            if (!isset($merged[$recipeId])) {
                $merged[$recipeId] = $item;

                continue;
            }

            $merged[$recipeId]['servings'] = round(
                num: $merged[$recipeId]['servings'] + $item['servings'],
                precision: ProductionIngredient::QUANTITY_PRECISION,
            );
        }

        return array_values(array: $merged);
    }
}
