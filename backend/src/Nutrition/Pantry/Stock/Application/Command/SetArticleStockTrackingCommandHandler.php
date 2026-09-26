<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockLedger;
use Nutrition\Pantry\Stock\Domain\Exception\SetArticleStockTrackingException;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Nutrition\Pantry\Stock\Domain\Model\StockEstimate;
use Nutrition\Pantry\Stock\Domain\Model\StockTrackingMode;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class SetArticleStockTrackingCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private UpdateArticleStockNeedleDataQuery $needleDataQuery,
        private StockLedger $stockLedger,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(SetArticleStockTrackingCommand $command): void
    {
        $pack = $this->needleDataQuery->findArticlePack(articleId: $command->articleId);

        if (null === $pack) {
            throw SetArticleStockTrackingException::articleNotFound(articleId: $command->articleId);
        }

        $trackingMode = StockTrackingMode::tryFrom(value: $command->trackingMode);

        if (null === $trackingMode) {
            throw SetArticleStockTrackingException::unknownTrackingMode(
                trackingMode: $command->trackingMode,
                allowed: StockTrackingMode::values(),
            );
        }

        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId)
            ?? ArticleStock::start(
                id: $this->articleStockRepository->nextId(),
                articleId: $command->articleId,
                quantity: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $articleStock->retrack(
            trackingMode: $trackingMode,
            estimate: StockEstimate::from(
                summary: $this->stockLedger->summaryOf(
                    kind: StockMovement::KIND_ARTICLE,
                    refId: $command->articleId,
                ),
                trackingMode: $trackingMode,
                packSize: $pack->size,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleStockRepository->save(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }
}
