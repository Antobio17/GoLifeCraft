<?php

namespace Mcp\Server\Mcp\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class QueryModelQuery implements Query
{
    /**
     * @param array<string, mixed>             $filters
     * @param string[]                         $include
     * @param array<int, array{field: string, dir: string}> $sort
     */
    public function __construct(
        public string $alias,
        public array $filters,
        public array $include,
        public array $sort,
        public int $page,
        public int $pageSize,
        public string $role,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.mcp.query.1.model.query';
    }
}
