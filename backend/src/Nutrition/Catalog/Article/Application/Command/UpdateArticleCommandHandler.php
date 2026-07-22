<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Exception\UpdateArticleException;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Nutrition\Catalog\Article\Domain\QueryModel\UpdateArticleNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateArticleCommandHandler
{
    public function __construct(
        private ArticleRepository $articleRepository,
        private UpdateArticleNeedleDataQuery $needleDataQuery,
        private ArticleNutritionFactsAssembler $nutritionFactsAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateArticleCommand $command): void
    {
        $article = $this->articleRepository->findById(id: $command->articleId);
        if (null === $article) {
            throw UpdateArticleException::articleNotFound(articleId: $command->articleId);
        }

        $nameAlreadyExists = $this->needleDataQuery->articleWithNameAlreadyExists(
            name: $command->name,
            excludingArticleId: $command->articleId,
        );
        if ($nameAlreadyExists) {
            throw UpdateArticleException::articleWithNameAlreadyExists(name: $command->name);
        }

        $existingNutritionFacts = null !== $article->nutritionFactsId
            ? $this->articleRepository->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId)
            : null;
        $nutritionFacts = $this->nutritionFactsAssembler->assemble(
            nutritionFacts: $existingNutritionFacts,
            nutrition: $command->nutrition,
            userId: $command->updatedByUserId,
        );
        $this->articleRepository->saveNutritionFacts(nutritionFacts: $nutritionFacts);

        $article->update(
            name: $command->name,
            recipeUnit: $command->recipeUnit,
            servingSize: $command->servingSize,
            price: $command->price,
            brand: $command->brand,
            emoji: $command->emoji,
            categoryId: $command->categoryId,
            supermarketId: $command->supermarketId,
            nutritionFactsId: $nutritionFacts->id,
            referenceAmount: $nutritionFacts->referenceAmount,
            calories: $nutritionFacts->calories,
            protein: $nutritionFacts->protein,
            fat: $nutritionFacts->fat,
            carbs: $nutritionFacts->carbs,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }
}
