<?php

namespace Nutrition\Menu\Menu\Domain\QueryModel\Dto;

use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class MenuDocumentResult implements QueryResult
{
    public function __construct(
        public string $fileName,
        public string $mimeType,
        public string $content,
    ) {
    }
}
