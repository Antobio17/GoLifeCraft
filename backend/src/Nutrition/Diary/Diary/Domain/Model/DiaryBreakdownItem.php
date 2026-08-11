<?php

namespace Nutrition\Diary\Diary\Domain\Model;

use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;

final readonly class DiaryBreakdownItem
{
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

    public function isRecipe(): bool
    {
        return DiaryEntryNode::KIND_RECIPE === $this->kind;
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
