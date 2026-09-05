<?php

namespace Nutrition\Pantry\Inventory\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Inventory\Application\Command\StartInventoryCommand;
use Nutrition\Pantry\Inventory\Domain\Exception\StartInventoryException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class StartInventoryController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new StartInventoryCommand(
                countedOn: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'countedOn'),
                shift: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'shift'),
                locationId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'locationId'),
                note: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'note', required: false),
                startedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    StartInventoryException::class => Response::HTTP_BAD_REQUEST,
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
