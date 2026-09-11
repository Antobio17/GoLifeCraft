<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\Controller;

use Nutrition\Shopping\Ticket\Application\Command\UpdateTicketItemCommand;
use Nutrition\Shopping\Ticket\Domain\Exception\UpdateTicketItemException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateTicketItemController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $ticketId, string $itemId): JsonResponse
    {
        try {
            $this->handle(message: new UpdateTicketItemCommand(
                ticketId: $ticketId,
                itemId: $itemId,
                quantity: (float) RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'quantity'),
                unitPrice: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'unitPrice', required: false),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateTicketItemException::class => Response::HTTP_BAD_REQUEST,
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
