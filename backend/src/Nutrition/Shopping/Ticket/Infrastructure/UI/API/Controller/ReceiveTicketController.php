<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\Controller;

use Nutrition\Shopping\Ticket\Application\Command\ReceiveTicketCommand;
use Nutrition\Shopping\Ticket\Domain\Exception\ReceiveTicketException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class ReceiveTicketController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $ticketId): JsonResponse
    {
        try {
            $this->handle(message: new ReceiveTicketCommand(
                ticketId: $ticketId,
                receivedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ReceiveTicketException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        }
    }
}
