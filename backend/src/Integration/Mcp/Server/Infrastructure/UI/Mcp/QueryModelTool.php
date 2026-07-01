<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp;

use Integration\Mcp\Server\Application\Query\QueryModelQuery;
use Mcp\Capability\Attribute\McpTool;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(name: 'query_model')]
final class QueryModelTool extends McpMessengerTool
{
    /**
     * @param array<string, mixed>                          $filters
     * @param string[]                                      $include
     * @param array<int, array{field: string, dir: string}> $sort
     */
    public function __invoke(
        string $alias,
        array $filters = [],
        array $include = [],
        array $sort = [],
        int $page = 1,
        int $pageSize = 20,
    ): array {
        return $this->dispatch(messageFactory: fn () => new QueryModelQuery(
            alias: $alias,
            filters: $filters,
            include: $include,
            sort: $sort,
            page: $page,
            pageSize: $pageSize,
            role: RequestExtractor::getUserRole(request: $this->request()),
        ));
    }
}
