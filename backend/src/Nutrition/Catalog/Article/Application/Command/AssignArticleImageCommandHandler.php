<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Exception\AssignArticleImageException;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final readonly class AssignArticleImageCommandHandler
{
    private const string IMAGE_AGGREGATE = 'article';

    public function __construct(
        private ArticleRepository $articleRepository,
        private ImageStorageService $imageStorageService,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AssignArticleImageCommand $command): void
    {
        $article = $this->articleRepository->findById(id: $command->articleId);

        if (null === $article) {
            throw AssignArticleImageException::articleNotFound(articleId: $command->articleId);
        }

        $this->imageStorageService->deleteAggregateImage(
            aggregate: self::IMAGE_AGGREGATE,
            aggregateId: $article->id,
            image: $article->image,
        );

        $article->assignImage(
            image: null === $command->imagePath ? null : $this->imageStorageService->storeAggregateImage(
                aggregate: self::IMAGE_AGGREGATE,
                aggregateId: $article->id,
                imagePath: $command->imagePath,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }
}
