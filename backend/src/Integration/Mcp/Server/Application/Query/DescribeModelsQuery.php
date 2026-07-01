<?php

namespace Integration\Mcp\Server\Application\Query;

use Shared\Shared\Shared\Application\Query\Query;

final readonly class DescribeModelsQuery implements Query
{
    /**
     * @param string[] $aliases
     */
    public function __construct(
        public array $aliases,
        public string $role,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.mcp.query.1.model.describe';
    }
}
