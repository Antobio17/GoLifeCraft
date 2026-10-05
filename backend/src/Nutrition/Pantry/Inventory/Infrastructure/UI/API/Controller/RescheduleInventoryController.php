<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Inventory\Application\Command\RescheduleInventoryCommand;
use Nutrition\Pantry\Inventory\Domain\Exception\RescheduleInventoryException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class RescheduleInventoryController
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
            $this->handle(message: new RescheduleInventoryCommand(
                inventoryId: $inventoryId,
                countedOn: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'countedOn'),
                shift: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'shift'),
                rescheduledByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    RescheduleInventoryException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
