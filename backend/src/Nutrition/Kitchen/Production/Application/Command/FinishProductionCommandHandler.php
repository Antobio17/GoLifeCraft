<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\FinishProductionException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\QueryModel\Dto\ProductionIngredient;
use Nutrition\Kitchen\Production\Domain\QueryModel\FinishProductionNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class FinishProductionCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private FinishProductionNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(FinishProductionCommand $command): void
    {
        $production = $this->productionRepository->findById(id: $command->productionId);
        if (null === $production) {
            throw FinishProductionException::productionNotFound(productionId: $command->productionId);
        }

        $production->finish(
            servingsCooked: $command->servingsCooked,
            consumedArticles: $this->consumedArticles(
                recipeId: $production->recipeId,
                servingsCooked: $command->servingsCooked,
            ),
            finishedByUserId: $command->finishedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }

    /**
     * Reading the recipe here is fine: the rule forbids writing two aggregates, not reading one.
     * The pantry is never touched from this handler, only told through the event.
     *
     * @return array<int, array{articleId: string, quantity: float, unit: string}>
     */
    private function consumedArticles(string $recipeId, float $servingsCooked): array
    {
        $consumed = [];

        foreach ($this->needleDataQuery->resolveIngredients(recipeId: $recipeId, servings: $servingsCooked) as $ingredient) {
            $consumed[] = [
                'articleId' => $ingredient->articleId,
                'quantity' => $ingredient->baseQuantity,
                'unit' => $ingredient->baseUnit,
            ];
        }

        return $this->mergeByArticle(consumed: $consumed);
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
}
