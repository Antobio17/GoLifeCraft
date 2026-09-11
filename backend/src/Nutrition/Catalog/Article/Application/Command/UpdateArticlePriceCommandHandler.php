<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateArticlePriceCommandHandler
{
    public function __construct(
        private ArticleRepository $articleRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateArticlePriceCommand $command): void
    {
        $article = $this->articleRepository->findById(id: $command->articleId);

        if (null === $article) {
            return;
        }

        if ($article->price === $command->price) {
            return;
        }

        $article->changePrice(
            price: $command->price,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }
}
