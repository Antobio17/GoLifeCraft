<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

final readonly class ArticleDraftGrounding
{
    /**
     * @param array<string, string>                $categories   id => name
     * @param array<string, string>                $supermarkets id => name
     * @param array<string, array<string, string>> $aisles       supermarketId => [aisleId => name]
     */
    public function __construct(
        public array $categories,
        public array $supermarkets,
        public array $aisles,
    ) {
    }

    /**
     * @return string[]
     */
    public function categoryIds(): array
    {
        return array_keys($this->categories);
    }

    /**
     * @return string[]
     */
    public function supermarketIds(): array
    {
        return array_keys($this->supermarkets);
    }

    /**
     * @return string[]
     */
    public function aisleIds(): array
    {
        $aisleIds = [];
        foreach ($this->aisles as $aislesOfSupermarket) {
            $aisleIds = array_merge($aisleIds, array_keys($aislesOfSupermarket));
        }

        return $aisleIds;
    }

    public function belongsToSupermarket(?string $supermarketId, string $aisleId): bool
    {
        if (null === $supermarketId) {
            return false;
        }

        return isset($this->aisles[$supermarketId][$aisleId]);
    }
}
