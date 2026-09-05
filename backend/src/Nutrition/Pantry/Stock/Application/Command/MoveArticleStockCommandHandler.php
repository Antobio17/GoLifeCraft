<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Domain\Exception\MoveArticleStockException;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Nutrition\Pantry\Stock\Domain\QueryModel\MoveArticleStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class MoveArticleStockCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private MoveArticleStockNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(MoveArticleStockCommand $command): void
    {
        if (!$this->needleDataQuery->articleExists(articleId: $command->articleId)) {
            throw MoveArticleStockException::articleNotFound(articleId: $command->articleId);
        }

        if (null !== $command->locationId && !$this->needleDataQuery->locationExists(locationId: $command->locationId)) {
            throw MoveArticleStockException::locationNotFound(locationId: $command->locationId);
        }

        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId)
            ?? ArticleStock::start(
                id: $this->articleStockRepository->nextId(),
                articleId: $command->articleId,
                quantity: 0.0,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

        $articleStock->moveTo(
            locationId: $command->locationId,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleStockRepository->save(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }
}
