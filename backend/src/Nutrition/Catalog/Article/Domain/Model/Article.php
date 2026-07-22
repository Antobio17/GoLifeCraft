<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\Article\Domain\Event\ArticleCreated;
use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
use Nutrition\Catalog\Article\Domain\Event\ArticleUpdated;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Article extends GenericAggregate
{
    public string $name;
    public string $recipeUnit;
    public ?float $servingSize = null;
    public ?float $price = null;
    public ?string $brand = null;
    public ?string $emoji = null;
    public ?string $categoryId = null;
    public ?string $supermarketId = null;
    public ?string $nutritionFactsId = null;
    public ?string $barcode = null;

    public static function create(
        string $id,
        string $name,
        string $recipeUnit,
        ?float $servingSize,
        ?float $price,
        ?string $brand,
        ?string $emoji,
        ?string $categoryId,
        ?string $supermarketId,
        ?string $nutritionFactsId,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $article = new self();
        $article->id = $id;
        $article->name = $name;
        $article->recipeUnit = $recipeUnit;
        $article->servingSize = $servingSize;
        $article->price = $price;
        $article->brand = $brand;
        $article->emoji = $emoji;
        $article->categoryId = $categoryId;
        $article->supermarketId = $supermarketId;
        $article->nutritionFactsId = $nutritionFactsId;
        $article->stampCreation(userId: $createdByUserId, now: $now);

        $article->record(event: new ArticleCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
        ));

        return $article;
    }

    public function assignBarcode(?string $barcode): void
    {
        $this->barcode = $barcode;
    }

    public function update(
        string $name,
        string $recipeUnit,
        ?float $servingSize,
        ?float $price,
        ?string $brand,
        ?string $emoji,
        ?string $categoryId,
        ?string $supermarketId,
        ?string $nutritionFactsId,
        float $referenceAmount,
        ?float $calories,
        ?float $protein,
        ?float $fat,
        ?float $carbs,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->recipeUnit = $recipeUnit;
        $this->servingSize = $servingSize;
        $this->price = $price;
        $this->brand = $brand;
        $this->emoji = $emoji;
        $this->categoryId = $categoryId;
        $this->supermarketId = $supermarketId;
        $this->nutritionFactsId = $nutritionFactsId;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
            emoji: $emoji,
            referenceAmount: $referenceAmount,
            calories: $calories,
            protein: $protein,
            fat: $fat,
            carbs: $carbs,
        ));
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new ArticleDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
        ));
    }
}
