<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;

final class GetMenuShoppingNeedsResult extends QueryAggregateResult
{
    /**
     * @param MenuShoppingNeedView[] $needs
     */
    public function __construct(
        string $id,
        string $aggregateName,
        public readonly string $menuName,
        public readonly string $menuEmoji,
        public readonly array $needs,
        public readonly int $needCount,
    ) {
        parent::__construct(id: $id, aggregateName: $aggregateName);
    }
}
