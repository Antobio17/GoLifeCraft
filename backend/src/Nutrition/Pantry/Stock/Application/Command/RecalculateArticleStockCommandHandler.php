<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockLedgerSummarizer;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;
use Nutrition\Pantry\Stock\Domain\Service\StockEstimator;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RecalculateArticleStockCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private UpdateArticleStockNeedleDataQuery $needleDataQuery,
        private StockLedgerSummarizer $ledgerSummarizer,
        private StockEstimator $stockEstimator,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RecalculateArticleStockCommand $command): void
    {
        $policy = $this->needleDataQuery->findArticlePolicy(articleId: $command->articleId);

        if (null === $policy) {
            return;
        }

        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId)
            ?? ArticleStock::start(
                id: $this->articleStockRepository->nextId(),
                articleId: $command->articleId,
                quantity: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $articleStock->change(
            estimate: $this->stockEstimator->estimate(
                summary: $this->ledgerSummarizer->summarize(
                    kind: StockMovement::KIND_ARTICLE,
                    refId: $command->articleId,
                ),
                trackingMode: $articleStock->tracking(),
                packSize: $policy->packSize,
                previousReference: $articleStock->referenceQuantity,
                now: $this->dateTimeGenerator->now(),
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleStockRepository->save(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }
}
