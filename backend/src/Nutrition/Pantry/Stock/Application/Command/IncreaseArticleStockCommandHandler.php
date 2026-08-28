<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class IncreaseArticleStockCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(IncreaseArticleStockCommand $command): void
    {
        $articleStock = $this->articleStockRepository->findByArticleId(articleId: $command->articleId);
        if (null === $articleStock) {
            return;
        }

        $articleStock->increase(
            quantity: $command->quantity,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleStockRepository->save(articleStock: $articleStock);
        $this->domainEventCollectorService->register(aggregate: $articleStock);
    }
}
