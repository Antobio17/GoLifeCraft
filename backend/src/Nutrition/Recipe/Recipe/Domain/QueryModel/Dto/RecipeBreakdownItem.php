<?php

namespace Nutrition\Recipe\Recipe\Domain\QueryModel\Dto;

final readonly class RecipeBreakdownItem
{
    public const KIND_PRODUCT = 'product';

    public const KIND_RECIPE = 'recipe';

    public const PATH_SEPARATOR = '.';

    public function __construct(
        public string $path,
        public ?string $parentPath,
        public int $depth,
        public int $position,
        public string $kind,
        public string $refId,
        public float $quantity,
        public ?string $unit,
        public string $name,
        public string $emoji,
        public MacroBreakdown $macros,
    ) {
    }

    public static function buildPath(?string $parentPath, int $position): string
    {
        return null === $parentPath ? (string) $position : $parentPath.self::PATH_SEPARATOR.$position;
    }

    public static function parentPathOf(string $path): ?string
    {
        $separator = strrpos(haystack: $path, needle: self::PATH_SEPARATOR);

        return false === $separator ? null : substr(string: $path, offset: 0, length: $separator);
    }

    public static function round(float $value): float
    {
        return round(num: $value, precision: 4);
    }

    public function isRecipe(): bool
    {
        return self::KIND_RECIPE === $this->kind;
    }

    public function withSnapshot(string $name, string $emoji, ?string $unit, MacroBreakdown $macros): self
    {
        return new self(
            path: $this->path,
            parentPath: $this->parentPath,
            depth: $this->depth,
            position: $this->position,
            kind: $this->kind,
            refId: $this->refId,
            quantity: $this->quantity,
            unit: $unit,
            name: $name,
            emoji: $emoji,
            macros: $macros,
        );
    }
}
