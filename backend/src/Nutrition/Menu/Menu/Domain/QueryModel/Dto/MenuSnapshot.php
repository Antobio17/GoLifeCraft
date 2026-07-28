<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

final readonly class MenuSnapshot
{
    /**
     * @param array<int, MenuItemSnapshot> $items
     */
    public function __construct(
        public string $id,
        public string $name,
        public string $emoji,
        public string $note,
        public string $type,
        public array $items,
    ) {
    }
}
