<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Application\Command\WriteModelCommand;
use Mcp\Capability\Attribute\McpTool;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(name: 'write_model')]
final class WriteModelTool extends McpMessengerTool
{
    /**
     * @param array<string, mixed> $data
     */
    public function __invoke(
        string $alias,
        array $data,
        ?string $id = null,
    ): array {
        return $this->dispatch(messageFactory: fn () => new WriteModelCommand(
            entityAlias: $alias,
            data: $data,
            id: $id,
            userSessionId: RequestExtractor::getUserSessionId(request: $this->request()),
            role: RequestExtractor::getUserRole(request: $this->request()),
        ));
    }
}
