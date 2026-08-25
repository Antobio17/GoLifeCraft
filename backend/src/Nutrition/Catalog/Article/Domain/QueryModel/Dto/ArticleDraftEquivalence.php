<?php

namespace Nutrition\Catalog\Article\Domain\QueryModel\Dto;

use Nutrition\Catalog\Article\Domain\Model\ArticlePackaging;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;

final readonly class ArticleDraftEquivalence
{
    public function __construct(
        public string $unit,
        public float $quantity,
    ) {
    }

    /**
     * @return self[]
     */
    public static function fromPackaging(ArticlePackaging $packaging): array
    {
        $equivalences = [];

        if (null !== $packaging->packSize) {
            $equivalences[] = new self(unit: ArticleUnit::PACK->value, quantity: $packaging->packSize);
        }

        $unitSize = $packaging->unitSize();
        if (null !== $unitSize) {
            $equivalences[] = new self(unit: ArticleUnit::UNIT->value, quantity: $unitSize);
        }

        return $equivalences;
    }
}
