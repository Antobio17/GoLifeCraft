<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Application\Command\WriteModelCommand;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(name: 'write_model')]
final class WriteModelTool extends McpMessengerTool
{
    /**
     * @param array<string, mixed> $data
     */
    public function __invoke(
        string $alias,
        #[Schema(
            type: 'object',
            description: 'A single record as a field-to-value map (e.g. {"name": "Rice", "recipeUnit": "gram"}). Include writable relation names as nested objects. Not an array of records.',
            additionalProperties: true,
        )]
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
