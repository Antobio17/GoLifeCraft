<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteArticleStockCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteArticleStockCommand $command): void
    {
        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId);
        if (null === $articleStock) {
            return;
        }

        $articleStock->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleStockRepository->delete(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }
}
