<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

use Integration\Mcp\Server\Application\Command\DeleteModelCommand;
use Mcp\Capability\Attribute\McpTool;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;

#[McpTool(
    name: 'delete_model',
    description: 'Permanently deletes one record of a deletable resource. Deleting a parent also deletes the records listed in its deleteCascadesTo, so removing a menu removes its menu items too. Call describe_models first to check that the resource is deletable.',
)]
final class DeleteModelTool extends McpMessengerTool
{
    public function __invoke(string $alias, string $id): array
    {
        return $this->dispatch(messageFactory: fn () => new DeleteModelCommand(
            entityAlias: $alias,
            id: $id,
            userSessionId: RequestExtractor::getUserSessionId(request: $this->request()),
            role: RequestExtractor::getUserRole(request: $this->request()),
        ));
    }
}
