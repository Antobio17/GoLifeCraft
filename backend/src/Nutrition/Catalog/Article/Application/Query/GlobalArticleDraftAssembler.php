<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\Model\ArticlePackaging;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraft;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftEquivalence;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;

final readonly class GlobalArticleDraftAssembler
{
    public function assemble(GlobalArticle $globalArticle): ArticleDraft
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: $globalArticle->quantity);

        return new ArticleDraft(
            name: $globalArticle->name,
            brand: $globalArticle->brand,
            emoji: null,
            price: $globalArticle->price,
            categoryId: null,
            supermarketId: null,
            aisleId: null,
            quantity: $globalArticle->quantity,
            baseUnit: $packaging->baseUnit,
            recipeUnit: $packaging->baseUnit,
            diaryUnit: $packaging->diaryUnit(),
            packUnit: $packaging->packUnit(),
            equivalences: ArticleDraftEquivalence::fromPackaging(packaging: $packaging),
            nutrition: $this->nutrition(globalArticle: $globalArticle),
        );
    }

    private function nutrition(GlobalArticle $globalArticle): ArticleDraftNutrition
    {
        return new ArticleDraftNutrition(
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
}
