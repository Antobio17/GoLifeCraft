<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\GlobalCatalog\Article\Domain\Event\GlobalArticleUpdated;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class GlobalArticle extends GenericAggregate
{
    public const string SYSTEM_USER_ID = 'system';

    public string $barcode;
    public string $name;
    public ?string $brand = null;
    public ?string $categoryName = null;
    public ?string $imageUrl = null;
    public ?string $quantity = null;
    public ?string $stores = null;
    public ?float $price = null;
    public ?float $bulkPrice = null;
    public ?float $referencePrice = null;
    public ?string $referenceFormat = null;
    public ?float $previousPrice = null;
    public string $source;
    public float $referenceAmount;
    public ?float $calories = null;
    public ?float $protein = null;
    public ?float $carbs = null;
    public ?float $sugars = null;
    public ?float $fat = null;
    public ?float $saturatedFat = null;
    public ?float $fiber = null;
    public ?float $salt = null;

    public static function create(
        string $id,
        string $barcode,
        string $name,
        ?string $brand,
        ?string $categoryName,
        ?string $imageUrl,
        ?string $quantity,
        ?string $stores,
        GlobalArticlePricing $pricing,
        string $source,
        GlobalArticleNutrition $nutrition,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $globalArticle = new self();
        $globalArticle->id = $id;
        $globalArticle->barcode = $barcode;
        $globalArticle->source = $source;
        $globalArticle->stampCreation(userId: self::SYSTEM_USER_ID, now: $dateTimeGenerator->now());
        $globalArticle->apply(
            name: $name,
            brand: $brand,
            categoryName: $categoryName,
            imageUrl: $imageUrl,
            quantity: $quantity,
            stores: $stores,
            pricing: $pricing,
            nutrition: $nutrition,
            dateTimeGenerator: $dateTimeGenerator,
        );

        return $globalArticle;
    }

    public function apply(
        string $name,
        ?string $brand,
        ?string $categoryName,
        ?string $imageUrl,
        ?string $quantity,
        ?string $stores,
        GlobalArticlePricing $pricing,
        GlobalArticleNutrition $nutrition,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->name = $name;
        $this->brand = $brand;
        $this->categoryName = $categoryName;
        $this->imageUrl = $imageUrl;
        $this->quantity = $quantity;
        $this->stores = $stores;
        $this->writePricing(pricing: $pricing);
        $this->writeNutrition(nutrition: $nutrition);
        $this->stampUpdate(userId: self::SYSTEM_USER_ID, now: $dateTimeGenerator->now());
    }

    public function correct(
        string $name,
        ?string $brand,
        ?string $categoryName,
        ?string $quantity,
        GlobalArticlePricing $pricing,
        GlobalArticleNutrition $nutrition,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $trimmedName = trim(string: $name);

        if ('' === $trimmedName) {
            throw UpdateGlobalArticleException::nameRequired(globalArticleId: $this->id);
        }

        $this->assertNotNegative(values: [
            'price' => $pricing->price,
            'previousPrice' => $pricing->previousPrice,
            'referencePrice' => $pricing->referencePrice,
            'calories' => $nutrition->calories,
            'protein' => $nutrition->protein,
            'carbs' => $nutrition->carbs,
            'sugars' => $nutrition->sugars,
            'fat' => $nutrition->fat,
            'saturatedFat' => $nutrition->saturatedFat,
            'fiber' => $nutrition->fiber,
            'salt' => $nutrition->salt,
        ]);

        $now = $dateTimeGenerator->now();

        $this->name = $trimmedName;
        $this->brand = $brand;
        $this->categoryName = $categoryName;
        $this->quantity = $quantity;
        $this->writePricing(pricing: $pricing);
        $this->writeNutrition(nutrition: $nutrition);
        $this->stampUpdate(userId: $updatedByUserId, now: $now);

        $this->record(event: new GlobalArticleUpdated(
            aggregateId: $this->id,
            occurredOn: $now,
            barcode: $this->barcode,
            name: $this->name,
            brand: $this->brand,
            categoryName: $this->categoryName,
            imageUrl: $this->imageUrl,
            quantity: $this->quantity,
            stores: $this->stores,
            price: $this->price,
            bulkPrice: $this->bulkPrice,
            referencePrice: $this->referencePrice,
            referenceFormat: $this->referenceFormat,
            previousPrice: $this->previousPrice,
            source: $this->source,
            referenceAmount: $this->referenceAmount,
            calories: $this->calories,
            protein: $this->protein,
            carbs: $this->carbs,
            sugars: $this->sugars,
            fat: $this->fat,
            saturatedFat: $this->saturatedFat,
            fiber: $this->fiber,
            salt: $this->salt,
            createdAt: $this->createdAt,
            updatedAt: $this->updatedAt,
            createdByUserId: $this->createdByUserId,
            updatedByUserId: $this->updatedByUserId,
        ));
    }

    public function pricing(): GlobalArticlePricing
    {
        return new GlobalArticlePricing(
            price: $this->price,
            bulkPrice: $this->bulkPrice,
            referencePrice: $this->referencePrice,
            referenceFormat: $this->referenceFormat,
            previousPrice: $this->previousPrice,
        );
    }

    public function nutrition(): GlobalArticleNutrition
    {
        return new GlobalArticleNutrition(
            referenceAmount: $this->referenceAmount,
            calories: $this->calories,
            protein: $this->protein,
            carbs: $this->carbs,
            sugars: $this->sugars,
            fat: $this->fat,
            saturatedFat: $this->saturatedFat,
            fiber: $this->fiber,
            salt: $this->salt,
        );
    }

    /**
     * @param array<string, float|null> $values
     */
    private function assertNotNegative(array $values): void
    {
        foreach ($values as $field => $value) {
            if (null !== $value && $value < 0) {
                throw UpdateGlobalArticleException::negativeValue(globalArticleId: $this->id, field: $field);
            }
        }
    }

    private function writePricing(GlobalArticlePricing $pricing): void
    {
        $this->price = $pricing->price;
        $this->bulkPrice = $pricing->bulkPrice;
        $this->referencePrice = $pricing->referencePrice;
        $this->referenceFormat = $pricing->referenceFormat;
        $this->previousPrice = $pricing->previousPrice;
    }

    private function writeNutrition(GlobalArticleNutrition $nutrition): void
    {
        $this->referenceAmount = $nutrition->referenceAmount;
        $this->calories = $nutrition->calories;
        $this->protein = $nutrition->protein;
        $this->carbs = $nutrition->carbs;
        $this->sugars = $nutrition->sugars;
        $this->fat = $nutrition->fat;
        $this->saturatedFat = $nutrition->saturatedFat;
        $this->fiber = $nutrition->fiber;
        $this->salt = $nutrition->salt;
    }
}
