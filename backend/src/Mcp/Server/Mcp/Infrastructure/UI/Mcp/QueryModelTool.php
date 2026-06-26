<?php

namespace Mcp\Server\Mcp\Infrastructure\UI\Mcp;

use Mcp\Capability\Attribute\McpTool;
use Mcp\Server\Mcp\Application\Query\QueryModelQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class QueryModelTool
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly RequestStack $requestStack,
    ) {
        $this->messageBus = $messageBus;
    }

    /**
     * @param array<string, mixed>                           $filters
     * @param string[]                                       $include
     * @param array<int, array{field: string, dir: string}> $sort
     */
    #[McpTool(name: 'query_model')]
    public function __invoke(
        string $alias,
        array $filters = [],
        array $include = [],
        array $sort = [],
        int $page = 1,
        int $pageSize = 20,
    ): array {
        $request = $this->requestStack->getCurrentRequest();

        try {
            return $this->handle(message: new QueryModelQuery(
                alias: $alias,
                filters: $filters,
                include: $include,
                sort: $sort,
                page: $page,
                pageSize: $pageSize,
                role: RequestExtractor::getUserRole(request: $request) ?? '',
            ));
        } catch (HandlerFailedException $exception) {
            return McpToolResult::fromHandlerFailure(exception: $exception);
        }
    }
}
