<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\Article\Domain\Event\ArticleCreated;
use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
use Nutrition\Catalog\Article\Domain\Event\ArticleImageAssigned;
use Nutrition\Catalog\Article\Domain\Event\ArticleUpdated;
use Nutrition\Catalog\Article\Domain\Exception\CreateArticleException;
use Nutrition\Catalog\Article\Domain\Exception\UpdateArticleException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class Article extends GenericAggregate
{
    public const BASE_UNIT_GRAM = 'g';
    public const BASE_UNIT_MILLILITER = 'ml';
    public const BASE_UNITS = [self::BASE_UNIT_GRAM, self::BASE_UNIT_MILLILITER];

    public string $name;
    public string $recipeUnit;
    public string $baseUnit = self::BASE_UNIT_GRAM;
    public string $diaryUnit = self::BASE_UNIT_GRAM;
    public ?string $packUnit = null;
    public ?float $price = null;
    public ?string $brand = null;
    public ?string $emoji = null;
    public ?string $image = null;
    public ?string $categoryId = null;
    public ?string $supermarketId = null;
    public ?string $aisleId = null;
    public ?string $nutritionFactsId = null;
    public ?string $barcode = null;

    /** @var ArticleEquivalence[] */
    public array $equivalences = [];

    /**
     * @param ArticleEquivalence[] $equivalences
     */
    public static function create(
        string $id,
        string $name,
        string $recipeUnit,
        string $baseUnit,
        string $diaryUnit,
        ?string $packUnit,
        ?float $price,
        ?string $brand,
        ?string $emoji,
        ?string $image,
        ?string $categoryId,
        ?string $supermarketId,
        ?string $aisleId,
        ?string $nutritionFactsId,
        ?string $barcode,
        array $equivalences,
        ?array $nutritionFacts,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        if (!in_array($baseUnit, self::BASE_UNITS, true)) {
            throw CreateArticleException::baseUnitIsNotSupported(baseUnit: $baseUnit);
        }

        $unsupportedUnit = self::findUnsupportedUnit(
            recipeUnit: $recipeUnit,
            diaryUnit: $diaryUnit,
            equivalences: $equivalences,
        );

        if (null !== $unsupportedUnit) {
            throw CreateArticleException::unitIsNotSupported(unit: $unsupportedUnit);
        }

        if (!self::isPackUnitAvailable(packUnit: $packUnit, equivalences: $equivalences)) {
            throw CreateArticleException::packUnitIsNotAnEquivalence(packUnit: $packUnit);
        }

        $now = $dateTimeGenerator->now();

        $article = new self();
        $article->id = $id;
        $article->name = $name;
        $article->recipeUnit = $recipeUnit;
        $article->baseUnit = $baseUnit;
        $article->diaryUnit = $diaryUnit;
        $article->packUnit = $packUnit;
        $article->price = $price;
        $article->brand = $brand;
        $article->emoji = $emoji;
        $article->image = $image;
        $article->categoryId = $categoryId;
        $article->supermarketId = $supermarketId;
        $article->aisleId = self::resolveAisleId(supermarketId: $supermarketId, aisleId: $aisleId);
        $article->nutritionFactsId = $nutritionFactsId;
        $article->barcode = $barcode;
        $article->equivalences = $equivalences;
        $article->stampCreation(userId: $createdByUserId, now: $now);

        $article->record(event: new ArticleCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            brand: $brand,
            emoji: $emoji,
            image: $image,
            baseUnit: $baseUnit,
            recipeUnit: $recipeUnit,
            diaryUnit: $diaryUnit,
            packUnit: $packUnit,
            price: $price,
            categoryId: $categoryId,
            supermarketId: $article->supermarketId,
            aisleId: $article->aisleId,
            nutritionFactsId: $nutritionFactsId,
            barcode: $article->barcode,
            equivalences: self::snapshotAll(aggregates: $equivalences),
            nutritionFacts: $nutritionFacts,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
        ));

        return $article;
    }

    public function assignImage(
        ?string $image,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->image = $image;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleImageAssigned(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            brand: $this->brand,
            emoji: $this->emoji,
            image: $image,
            baseUnit: $this->baseUnit,
            recipeUnit: $this->recipeUnit,
            diaryUnit: $this->diaryUnit,
            packUnit: $this->packUnit,
            price: $this->price,
            categoryId: $this->categoryId,
            supermarketId: $this->supermarketId,
            aisleId: $this->aisleId,
            nutritionFactsId: $this->nutritionFactsId,
            barcode: $this->barcode,
            equivalences: self::snapshotAll(aggregates: $this->equivalences),
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    /**
     * @param ArticleEquivalence[] $equivalences
     */
    public function update(
        string $name,
        string $recipeUnit,
        string $baseUnit,
        string $diaryUnit,
        ?string $packUnit,
        ?float $price,
        ?string $brand,
        ?string $emoji,
        ?string $image,
        ?string $categoryId,
        ?string $supermarketId,
        ?string $aisleId,
        ?string $nutritionFactsId,
        array $equivalences,
        ?array $nutritionFacts,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (!in_array($baseUnit, self::BASE_UNITS, true)) {
            throw UpdateArticleException::baseUnitIsNotSupported(baseUnit: $baseUnit);
        }

        $unsupportedUnit = self::findUnsupportedUnit(
            recipeUnit: $recipeUnit,
            diaryUnit: $diaryUnit,
            equivalences: $equivalences,
        );

        if (null !== $unsupportedUnit) {
            throw UpdateArticleException::unitIsNotSupported(unit: $unsupportedUnit);
        }

        if (!self::isPackUnitAvailable(packUnit: $packUnit, equivalences: $equivalences)) {
            throw UpdateArticleException::packUnitIsNotAnEquivalence(packUnit: $packUnit);
        }

        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->recipeUnit = $recipeUnit;
        $this->baseUnit = $baseUnit;
        $this->diaryUnit = $diaryUnit;
        $this->packUnit = $packUnit;
        $this->price = $price;
        $this->brand = $brand;
        $this->emoji = $emoji;
        $this->image = $image;
        $this->categoryId = $categoryId;
        $this->supermarketId = $supermarketId;
        $this->aisleId = self::resolveAisleId(supermarketId: $supermarketId, aisleId: $aisleId);
        $this->nutritionFactsId = $nutritionFactsId;
        $this->equivalences = $equivalences;
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new ArticleUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $name,
            brand: $brand,
            emoji: $emoji,
            image: $image,
            baseUnit: $baseUnit,
            recipeUnit: $recipeUnit,
            diaryUnit: $diaryUnit,
            packUnit: $packUnit,
            price: $price,
            categoryId: $categoryId,
            supermarketId: $this->supermarketId,
            aisleId: $this->aisleId,
            nutritionFactsId: $nutritionFactsId,
            barcode: $this->barcode,
            equivalences: self::snapshotAll(aggregates: $equivalences),
            nutritionFacts: $nutritionFacts,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $updatedByUserId,
        ));
    }

    public function delete(
        ?array $nutritionFacts,
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();
        $this->stampUpdate(userId: $deletedByUserId, now: $now);

        $this->record(event: new ArticleDeleted(
            aggregateId: $this->id,
            occurredOn: $now,
            name: $this->name,
            brand: $this->brand,
            emoji: $this->emoji,
            image: $this->image,
            baseUnit: $this->baseUnit,
            recipeUnit: $this->recipeUnit,
            diaryUnit: $this->diaryUnit,
            packUnit: $this->packUnit,
            price: $this->price,
            categoryId: $this->categoryId,
            supermarketId: $this->supermarketId,
            aisleId: $this->aisleId,
            nutritionFactsId: $this->nutritionFactsId,
            barcode: $this->barcode,
            equivalences: self::snapshotAll(aggregates: $this->equivalences),
            nutritionFacts: $nutritionFacts,
            createdAt: $this->createdAt,
            updatedAt: $now,
            createdByUserId: $this->createdByUserId,
            deletedByUserId: $deletedByUserId,
        ));
    }

    public static function isMeasurementUnit(string $unit): bool
    {
        return in_array($unit, self::BASE_UNITS, true) || ArticleUnit::isAlias(unit: $unit);
    }

    private static function resolveAisleId(?string $supermarketId, ?string $aisleId): ?string
    {
        if (null === $supermarketId) {
            return null;
        }

        return $aisleId;
    }

    /**
     * @param ArticleEquivalence[] $equivalences
     */
    private static function findUnsupportedUnit(
        string $recipeUnit,
        string $diaryUnit,
        array $equivalences,
    ): ?string {
        foreach ([$recipeUnit, $diaryUnit] as $unit) {
            if (!self::isMeasurementUnit(unit: $unit)) {
                return $unit;
            }
        }

        foreach ($equivalences as $equivalence) {
            if (!ArticleUnit::isAlias(unit: $equivalence->unit)) {
                return $equivalence->unit;
            }
        }

        return null;
    }

    /**
     * @param ArticleEquivalence[] $equivalences
     */
    private static function isPackUnitAvailable(?string $packUnit, array $equivalences): bool
    {
        if (null === $packUnit) {
            return true;
        }

        foreach ($equivalences as $equivalence) {
            if ($equivalence->unit === $packUnit && $equivalence->quantity > 0) {
                return true;
            }
        }

        return false;
    }
}
