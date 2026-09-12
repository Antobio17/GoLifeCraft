<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockBalanceCalculator;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecalculateArticleStockCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private UpdateArticleStockNeedleDataQuery $needleDataQuery,
        private StockBalanceCalculator $balanceCalculator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RecalculateArticleStockCommand $command): void
    {
        if (!$this->needleDataQuery->articleExists(articleId: $command->articleId)) {
            return;
        }

        $quantity = $this->balanceCalculator->balanceFor(
            kind: StockMovement::KIND_ARTICLE,
            refId: $command->articleId,
        );

        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId)
            ?? ArticleStock::start(
                id: $this->articleStockRepository->nextId(),
                articleId: $command->articleId,
                quantity: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $articleStock->change(
            quantity: $quantity,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleStockRepository->save(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }
}
