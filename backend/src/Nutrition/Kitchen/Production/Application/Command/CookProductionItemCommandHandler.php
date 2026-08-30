<?php

namespace Nutrition\Kitchen\Production\Application\Command;

use Nutrition\Kitchen\Production\Domain\Exception\CookProductionItemException;
use Nutrition\Kitchen\Production\Domain\Model\ProductionCompositionLine;
use Nutrition\Kitchen\Production\Domain\Model\ProductionItem;
use Nutrition\Kitchen\Production\Domain\Model\ProductionRepository;
use Nutrition\Kitchen\Production\Domain\Service\ProductionCompositionResolver;
use Nutrition\Kitchen\Production\Domain\Service\ProductionLotAllocator;
use Nutrition\Kitchen\Production\Domain\Service\ProductionLotCodeGenerator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CookProductionItemCommandHandler
{
    public function __construct(
        private ProductionRepository $productionRepository,
        private ProductionCompositionResolver $compositionResolver,
        private ProductionLotCodeGenerator $lotCodeGenerator,
        private ProductionLotAllocator $lotAllocator,
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

        $production->cookItem(
            itemId: $command->itemId,
            servingsCooked: $command->servingsCooked,
            composition: $this->compositionFor(item: $item, servingsCooked: $command->servingsCooked),
            code: $item->code ?? $this->lotCodeGenerator->next(),
            cookedByUserId: $command->cookedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->productionRepository->save(production: $production);
        $this->domainEventCollectorService->register(aggregate: $production);
    }

    /**
     * What the cook actually put in, scaled from what was planned to what came out of the pot.
     * Batches planned before the composition was stored fall back to the recipe.
     *
     * @return ProductionCompositionLine[]
     */
    private function compositionFor(ProductionItem $item, float $servingsCooked): array
    {
        return $this->served(lines: $this->scaled(item: $item, servingsCooked: $servingsCooked));
    }

    /**
     * @return ProductionCompositionLine[]
     */
    private function scaled(ProductionItem $item, float $servingsCooked): array
    {
        if (!$item->hasComposition()) {
            return $this->compositionResolver->fromRecipe(recipeId: $item->recipeId, servings: $servingsCooked);
        }

        if ($item->servingsPlanned <= 0.0) {
            return $item->composition();
        }

        return ProductionCompositionLine::scaleAll(
            lines: $item->composition(),
            factor: $servingsCooked / $item->servingsPlanned,
        );
    }

    /**
     * A sub-recipe nobody picked a batch for eats the one that has been waiting the longest, the
     * same rule the diary follows.
     *
     * @param ProductionCompositionLine[] $lines
     *
     * @return ProductionCompositionLine[]
     */
    private function served(array $lines): array
    {
        return array_map(callback: function (ProductionCompositionLine $line): ProductionCompositionLine {
            if ($line->isArticle() || null !== $line->sourceProductionItemId) {
                return $line;
            }

            return $line->servedBy(sourceProductionItemId: $this->lotAllocator->findLotWithRoom(
                recipeId: $line->refId,
                servings: $line->quantity,
            ));
        }, array: $lines);
    }
}
