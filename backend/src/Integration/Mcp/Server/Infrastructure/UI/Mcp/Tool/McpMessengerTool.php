<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Tool;

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

    protected function dispatch(\Closure $messageFactory, ?\Closure $resultMapper = null): array
    {
        try {
            $result = $this->handle(message: $messageFactory());

            if (null !== $resultMapper) {
                return $resultMapper($result);
            }

            return $result ?? McpToolResult::success();
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
