<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp;

use Shared\Shared\Shared\Domain\Exception\BaseException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

abstract class McpMessengerTool
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly RequestStack $requestStack,
    ) {
        $this->messageBus = $messageBus;
    }

    protected function dispatch(\Closure $messageFactory): array
    {
        try {
            return $this->handle(message: $messageFactory()) ?? McpToolResult::success();
        } catch (BaseException $exception) {
            return McpToolResult::error(exception: $exception);
        } catch (HandlerFailedException $exception) {
            return McpToolResult::fromHandlerFailure(exception: $exception);
        }
    }

    protected function request(): Request
    {
        return $this->requestStack->getCurrentRequest() ?? new Request();
    }
}
