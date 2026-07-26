<?php

namespace Agenda\Agenda\Agenda\Infrastructure\UI\API\Controller;

use Agenda\Agenda\Agenda\Application\Command\DeleteAgendaEntryCommand;
use Agenda\Agenda\Agenda\Domain\Exception\DeleteAgendaEntryException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DeleteAgendaEntryController
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
            $this->handle(message: new DeleteAgendaEntryCommand(
                agendaEntryId: $request->attributes->get(key: 'agendaEntryId'),
                deletedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    DeleteAgendaEntryException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
