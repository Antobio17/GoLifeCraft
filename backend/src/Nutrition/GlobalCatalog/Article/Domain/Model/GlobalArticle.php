<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
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
