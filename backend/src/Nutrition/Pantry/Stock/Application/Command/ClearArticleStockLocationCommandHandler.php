<?php

namespace Nutrition\Pantry\Stock\Application\Command;

use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ClearArticleStockLocationCommandHandler
{
    public function __construct(
        private ArticleStockRepository $articleStockRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ClearArticleStockLocationCommand $command): void
    {
        foreach ($this->articleStockRepository->findByLocationId(locationId: $command->locationId) as $articleStock) {
            $articleStock->moveTo(
                locationId: null,
                updatedByUserId: $command->updatedByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->articleStockRepository->save(articleStock: $articleStock);
            $this->domainEventCollectorService->register(aggregate: $articleStock);
        }
    }
}
