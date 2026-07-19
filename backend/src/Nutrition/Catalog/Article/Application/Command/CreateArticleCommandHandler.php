<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Exception\CreateArticleException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Nutrition\Catalog\Article\Domain\QueryModel\CreateArticleNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateArticleCommandHandler
{
    public function __construct(
        private ArticleRepository $articleRepository,
        private CreateArticleNeedleDataQuery $needleDataQuery,
        private ArticleNutritionFactsAssembler $nutritionFactsAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateArticleCommand $command): void
    {
        if ($this->needleDataQuery->articleWithNameAlreadyExists(name: $command->name)) {
            throw CreateArticleException::articleWithNameAlreadyExists(name: $command->name);
        }

        $nutritionFacts = $this->nutritionFactsAssembler->assemble(
            nutritionFacts: null,
            nutrition: $command->nutrition,
            userId: $command->createdByUserId,
        );
        $this->articleRepository->saveNutritionFacts(nutritionFacts: $nutritionFacts);

        $article = Article::create(
            id: $this->articleRepository->nextId(),
            name: $command->name,
            recipeUnit: $command->recipeUnit,
            servingSize: $command->servingSize,
            price: $command->price,
            brand: $command->brand,
            emoji: $command->emoji,
            categoryId: $command->categoryId,
            supermarketId: $command->supermarketId,
            nutritionFactsId: $nutritionFacts->id,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }
}
