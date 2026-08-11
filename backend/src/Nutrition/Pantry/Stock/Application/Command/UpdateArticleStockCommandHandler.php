<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Domain\Exception\UpdateArticleStockException;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Nutrition\Pantry\Stock\Domain\QueryModel\UpdateArticleStockNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateArticleStockCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private UpdateArticleStockNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateArticleStockCommand $command): void
    {
        if (!$this->needleDataQuery->articleExists(articleId: $command->articleId)) {
            throw UpdateArticleStockException::articleNotFound(articleId: $command->articleId);
        }

        $articleStock = $this->applyQuantity(command: $command);

        $this->articleStockRepository->save(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }

    private function applyQuantity(UpdateArticleStockCommand $command): ArticleStock
    {
        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId);

        if (null === $articleStock) {
            return ArticleStock::start(
                id: $this->articleStockRepository->nextId(),
                articleId: $command->articleId,
                quantity: $command->quantity,
                createdByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );
        }

        $articleStock->change(
            quantity: $command->quantity,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        return $articleStock;
    }
}
