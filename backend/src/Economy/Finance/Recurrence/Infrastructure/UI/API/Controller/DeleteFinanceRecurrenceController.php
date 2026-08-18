<?php

namespace Economy\Finance\Recurrence\Infrastructure\UI\API\Controller;

use Economy\Finance\Recurrence\Application\Command\DeleteFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Domain\Exception\DeleteFinanceRecurrenceException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DeleteFinanceRecurrenceController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $financeRecurrenceId): JsonResponse
    {
        try {
            $this->handle(message: new DeleteFinanceRecurrenceCommand(
                financeRecurrenceId: $financeRecurrenceId,
                deletedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    DeleteFinanceRecurrenceException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
