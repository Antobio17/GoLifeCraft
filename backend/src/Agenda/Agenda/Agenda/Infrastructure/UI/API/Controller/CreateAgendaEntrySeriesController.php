<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\Controller;

use Agenda\Agenda\Agenda\Application\Command\CreateAgendaEntrySeriesCommand;
use Agenda\Agenda\Agenda\Domain\Exception\AgendaEntrySeriesException;
use Agenda\Agenda\Agenda\Domain\Exception\CreateAgendaEntryException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateAgendaEntrySeriesController
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
            $this->handle(message: new CreateAgendaEntrySeriesCommand(
                entryDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'entryDate'),
                endDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'endDate'),
                title: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'title'),
                kind: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'kind'),
                category: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'category', required: false),
                notes: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'notes', required: false),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    AgendaEntrySeriesException::class => Response::HTTP_BAD_REQUEST,
                    CreateAgendaEntryException::class => Response::HTTP_BAD_REQUEST,
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
