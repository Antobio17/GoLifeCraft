<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp;

use Integration\Mcp\Server\Application\Query\DescribeModelsQuery;
use Mcp\Capability\Attribute\McpTool;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(name: 'describe_models')]
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
