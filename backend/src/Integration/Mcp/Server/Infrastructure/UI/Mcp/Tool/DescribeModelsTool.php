<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Application\Query\DescribeModelsQuery;
use Mcp\Capability\Attribute\McpTool;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'describe_models',
    description: 'Lists the resources this server exposes and, for each one, its alias, its fields (type, whether they are writable, required, filterable or sortable) and its relations. Call it before query_model, write_model or delete_model to learn the alias to address and the rules a value has to satisfy. Pass aliases to describe only some of the resources.',
)]
final class DescribeModelsTool extends McpMessengerTool
{
    /**
     * @param string[] $aliases
     */
    public function __invoke(array $aliases = []): array
    {
        return $this->dispatch(messageFactory: fn () => new DescribeModelsQuery(
            aliases: $aliases,
            role: RequestExtractor::getUserRole(request: $this->request()),
        ));
    }
}
