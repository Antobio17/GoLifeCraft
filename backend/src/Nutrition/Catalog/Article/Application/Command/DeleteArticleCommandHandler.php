<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Exception\DeleteArticleException;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteArticleCommandHandler
{
    public function __construct(
        private ArticleRepository $articleRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteArticleCommand $command): void
    {
        $article = $this->articleRepository->findById(id: $command->articleId);
        if (null === $article) {
            throw DeleteArticleException::articleNotFound(articleId: $command->articleId);
        }

        $article->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->delete(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }
}
