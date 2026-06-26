<?php

namespace Mcp\Server\Mcp\Infrastructure\UI\Mcp;

use Mcp\Capability\Attribute\McpTool;
use Mcp\Server\Mcp\Application\Command\WriteModelCommand;
use Mcp\Server\Mcp\Domain\Exception\ModelNotExposedException;
use Mcp\Server\Mcp\Domain\Service\ModelMetadataProvider;
use Mcp\Server\Mcp\Domain\Service\ModelPermissionChecker;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class WriteModelTool
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly RequestStack $requestStack,
        private readonly ModelMetadataProvider $metadataProvider,
        private readonly ModelPermissionChecker $permissionChecker,
    ) {
        $this->messageBus = $messageBus;
    }

    /**
     * @param array<string, mixed> $data
     */
    #[McpTool(name: 'write_model')]
    public function __invoke(
        string $alias,
        array $data,
        ?string $id = null,
        ?int $expectedVersion = null,
    ): array {
        $request = $this->requestStack->getCurrentRequest();
        $role = RequestExtractor::getUserRole(request: $request) ?? '';

        try {
            $this->guardWritePermission(alias: $alias, role: $role);

            return $this->handle(message: new WriteModelCommand(
                entityAlias: $alias,
                data: $data,
                id: $id,
                expectedVersion: $expectedVersion,
                userSessionId: RequestExtractor::getUserSessionId(request: $request) ?? '',
                tenantSessionId: RequestExtractor::getTenantSessionId(request: $request) ?? '',
            ));
        } catch (ModelNotExposedException $exception) {
            return McpToolResult::error(exception: $exception);
        } catch (HandlerFailedException $exception) {
            return McpToolResult::fromHandlerFailure(exception: $exception);
        }
    }

    private function guardWritePermission(string $alias, string $role): void
    {
        $descriptor = $this->metadataProvider->describe(alias: $alias);

        if (!$this->permissionChecker->canWrite(role: $role, descriptor: $descriptor)) {
            throw ModelNotExposedException::alias(alias: $alias);
        }
    }
}
