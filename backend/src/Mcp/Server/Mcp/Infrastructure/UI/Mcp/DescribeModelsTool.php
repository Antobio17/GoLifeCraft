<?php

namespace Mcp\Server\Mcp\Infrastructure\UI\Mcp;

use Mcp\Capability\Attribute\McpTool;
use Mcp\Server\Mcp\Application\Query\DescribeModelsQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DescribeModelsTool
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly RequestStack $requestStack,
    ) {
        $this->messageBus = $messageBus;
    }

    /**
     * @param string[] $aliases
     */
    #[McpTool(name: 'describe_models')]
    public function __invoke(array $aliases = []): array
    {
        $request = $this->requestStack->getCurrentRequest();

        try {
            return $this->handle(message: new DescribeModelsQuery(
                aliases: $aliases,
                role: RequestExtractor::getUserRole(request: $request) ?? '',
            ));
        } catch (HandlerFailedException $exception) {
            return McpToolResult::fromHandlerFailure(exception: $exception);
        }
    }
}
