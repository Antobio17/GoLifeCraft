<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\Controller;

use Nutrition\Shopping\Ticket\Application\Command\CreateTicketCommand;
use Nutrition\Shopping\Ticket\Domain\Exception\AddTicketLinesException;
use Nutrition\Shopping\Ticket\Domain\Exception\CreateTicketException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateTicketController
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
            $this->handle(message: new CreateTicketCommand(
                ticketId: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'id'),
                storeName: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'storeName'),
                supermarketId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'supermarketId'),
                purchasedOn: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'purchasedOn'),
                total: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'total', required: false),
                note: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'note') ?? '',
                lines: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'lines'),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateTicketException::class => Response::HTTP_BAD_REQUEST,
                    AddTicketLinesException::class => Response::HTTP_BAD_REQUEST,
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
