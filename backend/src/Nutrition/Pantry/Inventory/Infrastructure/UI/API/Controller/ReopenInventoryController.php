<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Inventory\Application\Command\ReopenInventoryCommand;
use Nutrition\Pantry\Inventory\Domain\Exception\ReopenInventoryException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class ReopenInventoryController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $inventoryId): JsonResponse
    {
        try {
            $this->handle(message: new ReopenInventoryCommand(
                inventoryId: $inventoryId,
                reopenedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ReopenInventoryException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        }
    }
}
