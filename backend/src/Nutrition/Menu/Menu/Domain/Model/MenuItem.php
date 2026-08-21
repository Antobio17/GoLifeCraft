<?php

namespace Nutrition\Menu\Menu\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Menu\Menu\Domain\Exception\UpdateMenuException;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
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
    public bool $customized = false;

    /** @var MenuItemNode[] */
    public array $nodes = [];

    public static function createWithId(
        string $id,
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
        $item = self::create(
            menuId: $menuId,
            dayKey: $dayKey,
            meal: $meal,
            kind: $kind,
            refId: $refId,
            quantity: $quantity,
            unit: $unit,
            position: $position,
            createdByUserId: $createdByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $item->id = $id;

        return $item;
    }

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
     * Keeps the item identity — and therefore its breakdown — while the menu is rewritten.
     */
    public function reassign(
        ?string $dayKey,
        string $meal,
        float $quantity,
        ?string $unit,
        int $position,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ($this->isRecipe() && $this->hasTree() && $this->quantity > 0 && $quantity !== $this->quantity) {
            $this->scaleTree(
                factor: $quantity / $this->quantity,
                updatedByUserId: $updatedByUserId,
                dateTimeGenerator: $dateTimeGenerator,
            );
        }

        $this->dayKey = $dayKey;
        $this->meal = $meal;
        $this->quantity = $quantity;
        $this->unit = $unit;
        $this->position = $position;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function adjustQuantity(
        float $quantity,
        ?string $unit,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->reassign(
            dayKey: $this->dayKey,
            meal: $this->meal,
            quantity: $quantity,
            unit: $unit,
            position: $this->position,
            updatedByUserId: $updatedByUserId,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function moveTo(int $position, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        if ($this->position === $position) {
            return;
        }

        $this->position = $position;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function isRecipe(): bool
    {
        return self::KIND_RECIPE === $this->kind;
    }

    public function hasTree(): bool
    {
        return [] !== $this->nodes;
    }

    /** @param MenuItemNode[] $nodes */
    public function replaceTree(array $nodes, bool $customized): void
    {
        $this->nodes = array_values(array: $nodes);
        $this->customized = $customized;
    }

    public function scaleTree(float $factor, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        foreach ($this->nodes as $node) {
            $node->scale(factor: $factor, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }
    }

    public function adjustNode(
        string $nodePath,
        float $quantity,
        ?string $unit,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if ($quantity <= 0) {
            throw UpdateMenuException::quantityMustBePositive();
        }

        $node = $this->findNode(nodePath: $nodePath);
        if (null === $node) {
            throw UpdateMenuException::treeNodeNotFound(menuItemId: $this->id, nodePath: $nodePath);
        }

        $factor = $node->quantity > 0 ? $quantity / $node->quantity : 0.0;
        $node->adjust(quantity: $quantity, unit: $unit, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);

        if ($node->isRecipe() && $factor > 0) {
            $this->scaleDescendants(node: $node, factor: $factor, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }

        $this->customized = true;
    }

    public function findNode(string $nodePath): ?MenuItemNode
    {
        foreach ($this->nodes as $node) {
            if ($node->path === $nodePath) {
                return $node;
            }
        }

        return null;
    }

    public function treeMacros(): MacroBreakdown
    {
        $total = MacroBreakdown::zero();

        foreach ($this->nodes as $node) {
            if (null !== $node->parentNodeId) {
                continue;
            }

            $total = $total->add(other: $node->macros());
        }

        return $total;
    }

    /** @return array<int, array<string, mixed>> */
    public function treePayload(): array
    {
        return array_map(
            callback: static fn (MenuItemNode $node): array => $node->toPayload(),
            array: array_values(array: $this->nodes),
        );
    }

    /**
     * @return array{meal: string, kind: string, refId: string, quantity: float, unit: ?string, tree: array<int, array<string, mixed>>}
     */
    public function toPlannedItem(): array
    {
        return [
            'meal' => $this->meal,
            'kind' => $this->kind,
            'refId' => $this->refId,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'tree' => $this->customized ? $this->treePayload() : [],
        ];
    }

    private function scaleDescendants(
        MenuItemNode $node,
        float $factor,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        foreach ($this->nodes as $candidate) {
            if (!$candidate->isDescendantOf(other: $node)) {
                continue;
            }

            $candidate->scale(factor: $factor, updatedByUserId: $updatedByUserId, dateTimeGenerator: $dateTimeGenerator);
        }
    }
}
