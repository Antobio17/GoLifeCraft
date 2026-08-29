<?php

namespace Economy\Finance\Recurrence\Infrastructure\UI\API\Controller;

use Economy\Finance\Recurrence\Application\Command\GeneratePendingFinanceRecurrencesCommand;
use Economy\Finance\Recurrence\Application\Query\CountPendingFinanceRecurrencesQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GeneratePendingFinanceRecurrencesController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(): JsonResponse
    {
        try {
            $booked = $this->handle(message: new CountPendingFinanceRecurrencesQuery(onlyCurrentMonth: true));

            $this->handle(message: new GeneratePendingFinanceRecurrencesCommand(onlyCurrentMonth: true));

            return new JsonResponse(data: [
                'data' => [
                    'type' => 'financeRecurrenceRun',
                    'attributes' => [
                        'booked' => $booked,
                    ],
                ],
            ], status: Response::HTTP_OK);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
