<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Nutrition\Catalog\Article\Domain\Exception\ImportGlobalArticleException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticlePackaging;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;
use Nutrition\Catalog\Category\Domain\Model\Category;
use Nutrition\Catalog\Category\Domain\Model\CategoryRepository;
use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketRepository;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ImportGlobalArticleCommandHandler
{
    private const string DEFAULT_SUPERMARKET = 'Mercadona';

    public function __construct(
        private GlobalArticleRepository $globalArticleRepository,
        private ArticleRepository $articleRepository,
        private CategoryRepository $categoryRepository,
        private SupermarketRepository $supermarketRepository,
        private ArticleNutritionFactsAssembler $nutritionFactsAssembler,
        private ArticleEquivalenceAssembler $equivalenceAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ImportGlobalArticleCommand $command): void
    {
        $globalArticle = $this->globalArticleRepository->findById(id: $command->globalArticleId);
        if (null === $globalArticle) {
            throw ImportGlobalArticleException::globalArticleNotFound(globalArticleId: $command->globalArticleId);
        }

        $packaging = ArticlePackaging::fromQuantity(quantity: $globalArticle->quantity);
        $article = $this->articleRepository->findByBarcode(barcode: $globalArticle->barcode);

        if (null !== $article) {
            $this->refresh(article: $article, globalArticle: $globalArticle, packaging: $packaging, command: $command);

            return;
        }

        $this->import(globalArticle: $globalArticle, packaging: $packaging, command: $command);
    }

    private function import(GlobalArticle $globalArticle, ArticlePackaging $packaging, ImportGlobalArticleCommand $command): void
    {
        $nutritionFacts = $this->nutritionFactsAssembler->assemble(
            nutritionFacts: null,
            nutrition: $this->buildNutritionData(globalArticle: $globalArticle),
            userId: $command->importedByUserId,
        );
        $this->articleRepository->saveNutritionFacts(nutritionFacts: $nutritionFacts);
        $articleId = $this->articleRepository->nextId();

        $article = Article::create(
            id: $articleId,
            name: $globalArticle->name,
            recipeUnit: $packaging->baseUnit,
            baseUnit: $packaging->baseUnit,
            diaryUnit: $packaging->diaryUnit(),
            packUnit: $packaging->packUnit(),
            price: $globalArticle->price,
            brand: $globalArticle->brand,
            emoji: null,
            categoryId: $this->resolveCategoryId(globalArticle: $globalArticle, userId: $command->importedByUserId),
            supermarketId: $this->resolveSupermarketId(userId: $command->importedByUserId),
            aisleId: null,
            nutritionFactsId: $nutritionFacts->id,
            equivalences: $this->equivalenceAssembler->assemble(
                articleId: $articleId,
                equivalences: $this->buildEquivalences(packaging: $packaging),
                userId: $command->importedByUserId,
            ),
            createdByUserId: $command->importedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $article->assignBarcode(barcode: $globalArticle->barcode);

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }

    private function refresh(Article $article, GlobalArticle $globalArticle, ArticlePackaging $packaging, ImportGlobalArticleCommand $command): void
    {
        $existingNutritionFacts = null !== $article->nutritionFactsId
            ? $this->articleRepository->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId)
            : null;
        $nutritionFacts = $this->nutritionFactsAssembler->assemble(
            nutritionFacts: $existingNutritionFacts,
            nutrition: $this->buildNutritionData(globalArticle: $globalArticle),
            userId: $command->importedByUserId,
        );
        $this->articleRepository->saveNutritionFacts(nutritionFacts: $nutritionFacts);

        $article->update(
            name: $article->name,
            recipeUnit: $packaging->baseUnit,
            baseUnit: $packaging->baseUnit,
            diaryUnit: $packaging->diaryUnit(),
            packUnit: $packaging->packUnit(),
            price: $globalArticle->price,
            brand: $globalArticle->brand,
            emoji: $article->emoji,
            categoryId: $this->resolveCategoryId(globalArticle: $globalArticle, userId: $command->importedByUserId),
            supermarketId: $this->resolveSupermarketId(userId: $command->importedByUserId),
            aisleId: $article->aisleId,
            nutritionFactsId: $nutritionFacts->id,
            equivalences: $this->equivalenceAssembler->assemble(
                articleId: $article->id,
                equivalences: $this->buildEquivalences(packaging: $packaging),
                userId: $command->importedByUserId,
            ),
            referenceAmount: $nutritionFacts->referenceAmount,
            calories: $nutritionFacts->calories,
            protein: $nutritionFacts->protein,
            fat: $nutritionFacts->fat,
            carbs: $nutritionFacts->carbs,
            updatedByUserId: $command->importedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->articleRepository->save(article: $article);
        $this->domainEventCollectorService->register(aggregate: $article);
    }

    /**
     * @return ArticleEquivalenceData[]
     */
    private function buildEquivalences(ArticlePackaging $packaging): array
    {
        $equivalences = [];

        if (null !== $packaging->packSize) {
            $equivalences[] = new ArticleEquivalenceData(
                unit: ArticleUnit::PACK->value,
                quantity: $packaging->packSize,
                position: 1,
            );
        }

        $unitSize = $packaging->unitSize();
        if (null !== $unitSize) {
            $equivalences[] = new ArticleEquivalenceData(
                unit: ArticleUnit::UNIT->value,
                quantity: $unitSize,
                position: count($equivalences) + 1,
            );
        }

        return $equivalences;
    }

    private function buildNutritionData(GlobalArticle $globalArticle): ArticleNutritionData
    {
        return new ArticleNutritionData(
            referenceAmount: $globalArticle->referenceAmount,
            calories: $globalArticle->calories,
            protein: $globalArticle->protein,
            carbs: $globalArticle->carbs,
            sugars: $globalArticle->sugars,
            fat: $globalArticle->fat,
            saturatedFat: $globalArticle->saturatedFat,
            fiber: $globalArticle->fiber,
            salt: $globalArticle->salt,
        );
    }

    private function resolveCategoryId(GlobalArticle $globalArticle, string $userId): ?string
    {
        if (null === $globalArticle->categoryName) {
            return null;
        }

        $category = $this->categoryRepository->findByName(name: $globalArticle->categoryName);
        if (null !== $category) {
            return $category->id;
        }

        $category = Category::create(
            id: $this->categoryRepository->nextId(),
            name: $globalArticle->categoryName,
            createdByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->categoryRepository->save(category: $category);

        return $category->id;
    }

    private function resolveSupermarketId(string $userId): string
    {
        $supermarket = $this->supermarketRepository->findByName(name: self::DEFAULT_SUPERMARKET);
        if (null !== $supermarket) {
            return $supermarket->id;
        }

        $supermarket = Supermarket::create(
            id: $this->supermarketRepository->nextId(),
            name: self::DEFAULT_SUPERMARKET,
            createdByUserId: $userId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->supermarketRepository->save(supermarket: $supermarket);

        return $supermarket->id;
    }
}
