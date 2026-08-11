<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

class DiaryEntryNode extends GenericAggregate
{
    public const KIND_PRODUCT = 'product';

    public const KIND_RECIPE = 'recipe';

    public const PATH_SEPARATOR = '.';

    public const ID_SEPARATOR = '#';

    public string $diaryEntryId;

    public ?string $parentNodeId = null;

    public string $path;

    public string $kind;

    public string $refId;

    public float $quantity;

    public ?string $unit = null;

    public int $depth;

    public int $position;

    public string $nameSnapshot = '';

    public string $emojiSnapshot = '';

    public float $caloriesSnapshot = 0.0;

    public float $proteinSnapshot = 0.0;

    public float $fatSnapshot = 0.0;

    public float $carbsSnapshot = 0.0;

    public static function create(
        string $diaryEntryId,
        ?string $parentPath,
        string $kind,
        string $refId,
        float $quantity,
        ?string $unit,
        int $position,
        DiaryEntrySnapshot $snapshot,
        string $createdByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): self {
        $path = self::buildPath(parentPath: $parentPath, position: $position);
        $now = $dateTimeGenerator->now();

        $node = new self();
        $node->id = self::buildId(diaryEntryId: $diaryEntryId, path: $path);
        $node->diaryEntryId = $diaryEntryId;
        $node->parentNodeId = null === $parentPath
            ? null
            : self::buildId(diaryEntryId: $diaryEntryId, path: $parentPath);
        $node->path = $path;
        $node->kind = $kind;
        $node->refId = $refId;
        $node->quantity = $quantity;
        $node->unit = $unit;
        $node->depth = self::depthOf(path: $path);
        $node->position = $position;
        $node->writeSnapshot(snapshot: $snapshot);
        $node->stampCreation(userId: $createdByUserId, now: $now);

        return $node;
    }

    public static function buildId(string $diaryEntryId, string $path): string
    {
        return $diaryEntryId.self::ID_SEPARATOR.$path;
    }

    public static function buildPath(?string $parentPath, int $position): string
    {
        return null === $parentPath ? (string) $position : $parentPath.self::PATH_SEPARATOR.$position;
    }

    public function isRecipe(): bool
    {
        return self::KIND_RECIPE === $this->kind;
    }

    public function isDescendantOf(self $other): bool
    {
        return str_starts_with(haystack: $this->path, needle: $other->path.self::PATH_SEPARATOR);
    }

    public function scale(float $factor, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        $this->quantity = self::round(value: $this->quantity * $factor);
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function adjust(float $quantity, ?string $unit, string $updatedByUserId, DateTimeGenerator $dateTimeGenerator): void
    {
        $this->quantity = self::round(value: $quantity);
        $this->unit = $this->isRecipe() ? null : $unit;
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function applySnapshot(DiaryEntrySnapshot $snapshot): void
    {
        $this->writeSnapshot(snapshot: $snapshot);
    }

    public function rewrite(
        string $kind,
        string $refId,
        float $quantity,
        ?string $unit,
        DiaryEntrySnapshot $snapshot,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $this->kind = $kind;
        $this->refId = $refId;
        $this->quantity = self::round(value: $quantity);
        $this->unit = $unit;
        $this->writeSnapshot(snapshot: $snapshot);
        $this->stampUpdate(userId: $updatedByUserId, now: $dateTimeGenerator->now());
    }

    public function macros(): MacroBreakdown
    {
        return new MacroBreakdown(
            calories: $this->caloriesSnapshot,
            protein: $this->proteinSnapshot,
            fat: $this->fatSnapshot,
            carbs: $this->carbsSnapshot,
        );
    }

    public static function round(float $value): float
    {
        return round(num: $value, precision: 4);
    }

    private static function depthOf(string $path): int
    {
        return substr_count(haystack: $path, needle: self::PATH_SEPARATOR);
    }

    private function writeSnapshot(DiaryEntrySnapshot $snapshot): void
    {
        $this->nameSnapshot = $snapshot->name;
        $this->emojiSnapshot = $snapshot->emoji;
        $this->caloriesSnapshot = $snapshot->macros->calories;
        $this->proteinSnapshot = $snapshot->macros->protein;
        $this->fatSnapshot = $snapshot->macros->fat;
        $this->carbsSnapshot = $snapshot->macros->carbs;
    }
}
