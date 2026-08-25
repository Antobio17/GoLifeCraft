<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftPhoto;
use Shared\Shared\Shared\Application\Query\Query;

final readonly class GetArticleDraftQuery implements Query
{
    /**
     * @param ArticleDraftPhoto[] $photos
     */
    public function __construct(
        public array $photos,
        public string $userSessionId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.article_draft.get';
    }
}
