<?php

namespace Nutrition\Catalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Catalog\Article\Domain\Event\ArticleCreated;
use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
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
        ?string $categoryId,
        ?string $supermarketId,
        ?string $aisleId,
        ?string $nutritionFactsId,
        array $equivalences,
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
        $article->categoryId = $categoryId;
        $article->supermarketId = $supermarketId;
        $article->aisleId = self::resolveAisleId(supermarketId: $supermarketId, aisleId: $aisleId);
        $article->nutritionFactsId = $nutritionFactsId;
        $article->equivalences = $equivalences;
        $article->stampCreation(userId: $createdByUserId, now: $now);

        $article->record(event: new ArticleCreated(
            aggregateId: $id,
            occurredOn: $now,
            name: $name,
            baseUnit: $baseUnit,
            recipeUnit: $recipeUnit,
            diaryUnit: $diaryUnit,
            packUnit: $packUnit,
            equivalences: self::snapshotEquivalences(equivalences: $equivalences),
            supermarketId: $article->supermarketId,
            aisleId: $article->aisleId,
        ));

        return $article;
    }

    public function assignBarcode(?string $barcode): void
    {
        $this->barcode = $barcode;
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
        ?string $categoryId,
        ?string $supermarketId,
        ?string $aisleId,
        ?string $nutritionFactsId,
        array $equivalences,
        float $referenceAmount,
        ?float $calories,
        ?float $protein,
        ?float $fat,
        ?float $carbs,
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
            emoji: $emoji,
            baseUnit: $baseUnit,
            recipeUnit: $recipeUnit,
            diaryUnit: $diaryUnit,
            packUnit: $packUnit,
            equivalences: self::snapshotEquivalences(equivalences: $equivalences),
            referenceAmount: $referenceAmount,
            calories: $calories,
            protein: $protein,
            fat: $fat,
            carbs: $carbs,
            supermarketId: $this->supermarketId,
            aisleId: $this->aisleId,
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

    /**
     * @param ArticleEquivalence[] $equivalences
     *
     * @return array<int, array{unit: string, quantity: float, position: int}>
     */
    private static function snapshotEquivalences(array $equivalences): array
    {
        return array_map(
            callback: static fn (ArticleEquivalence $equivalence): array => [
                'unit' => $equivalence->unit,
                'quantity' => $equivalence->quantity,
                'position' => $equivalence->position,
            ],
            array: $equivalences,
        );
    }
}
