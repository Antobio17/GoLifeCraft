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
        string $source,
        float $referenceAmount,
        ?float $calories,
        ?float $protein,
        ?float $carbs,
        ?float $sugars,
        ?float $fat,
        ?float $saturatedFat,
        ?float $fiber,
        ?float $salt,
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
            referenceAmount: $referenceAmount,
            calories: $calories,
            protein: $protein,
            carbs: $carbs,
            sugars: $sugars,
            fat: $fat,
            saturatedFat: $saturatedFat,
            fiber: $fiber,
            salt: $salt,
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
        float $referenceAmount,
        ?float $calories,
        ?float $protein,
        ?float $carbs,
        ?float $sugars,
        ?float $fat,
        ?float $saturatedFat,
        ?float $fiber,
        ?float $salt,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->name = $name;
        $this->brand = $brand;
        $this->categoryName = $categoryName;
        $this->imageUrl = $imageUrl;
        $this->quantity = $quantity;
        $this->stores = $stores;
        $this->referenceAmount = $referenceAmount;
        $this->calories = $calories;
        $this->protein = $protein;
        $this->carbs = $carbs;
        $this->sugars = $sugars;
        $this->fat = $fat;
        $this->saturatedFat = $saturatedFat;
        $this->fiber = $fiber;
        $this->salt = $salt;
        $this->stampUpdate(userId: self::SYSTEM_USER_ID, now: $dateTimeGenerator->now());
    }
}
