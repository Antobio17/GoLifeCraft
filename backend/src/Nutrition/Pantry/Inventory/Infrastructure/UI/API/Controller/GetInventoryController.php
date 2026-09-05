<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Inventory\Application\Query\GetInventoryQuery;
use Nutrition\Pantry\Inventory\Domain\Exception\GetInventoryException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetInventoryController
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
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetInventoryQuery(
                    inventoryId: $inventoryId,
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetInventoryException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
