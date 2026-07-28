<?php

namespace Nutrition\Menu\Menu\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Ramsey\Uuid\Uuid;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class MenuItem extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';
    public const KIND_RECIPE = 'recipe';

    public const MEAL_BREAKFAST = 'breakfast';
    public const MEAL_LUNCH = 'lunch';
    public const MEAL_DINNER = 'dinner';
    public const MEAL_SNACK = 'snack';

    /** @var array<int, string> */
    public const KINDS = [
        self::KIND_PRODUCT,
        self::KIND_RECIPE,
    ];

    /** @var array<int, string> */
    public const MEALS = [
        self::MEAL_BREAKFAST,
        self::MEAL_LUNCH,
        self::MEAL_DINNER,
        self::MEAL_SNACK,
    ];

    public string $menuId;
    public ?string $dayKey = null;
    public string $meal;
    public string $kind;
    public string $refId;
    public float $quantity;
    public ?string $unit = null;
    public int $position;

    public static function create(
        string $menuId,
        ?string $dayKey,
        string $meal,
        string $kind,
        string $refId,
        float $quantity,
        ?string $unit,
        int $position,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $now = $dateTimeGenerator->now();

        $item = new self();
        $item->id = Uuid::uuid4()->toString();
        $item->menuId = $menuId;
        $item->dayKey = $dayKey;
        $item->meal = $meal;
        $item->kind = $kind;
        $item->refId = $refId;
        $item->quantity = $quantity;
        $item->unit = $unit;
        $item->position = $position;
        $item->stampCreation(userId: $createdByUserId, now: $now);

        return $item;
    }

    /**
     * @return array{meal: string, kind: string, refId: string, quantity: float, unit: ?string}
     */
    public function toPlannedItem(): array
    {
        return [
            'meal' => $this->meal,
            'kind' => $this->kind,
            'refId' => $this->refId,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
        ];
    }
}
