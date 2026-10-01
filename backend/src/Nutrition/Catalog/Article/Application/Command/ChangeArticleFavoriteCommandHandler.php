<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Exception\ChangeArticleFavoriteException;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ChangeArticleFavoriteCommandHandler
{
    public function __construct(
        private ArticleRepository $articleRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeArticleFavoriteCommand $command): void
    {
        $article = $this->articleRepository->findById(id: $command->articleId);

        if (null === $article) {
            throw ChangeArticleFavoriteException::articleNotFound(articleId: $command->articleId);
        }

        if ($article->favorite === $command->favorite) {
            return;
        }

        $article->changeFavorite(
            favorite: $command->favorite,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }
}
