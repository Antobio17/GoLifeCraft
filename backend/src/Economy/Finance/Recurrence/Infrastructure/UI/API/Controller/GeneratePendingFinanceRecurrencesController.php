<?php

namespace Economy\Finance\Recurrence\Infrastructure\UI\API\Controller;

use Economy\Finance\Recurrence\Application\Command\GeneratePendingFinanceRecurrencesCommand;
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
            return new JsonResponse(data: [
                'data' => [
                    'type' => 'financeRecurrenceRun',
                    'attributes' => [
                        'booked' => $this->handle(message: new GeneratePendingFinanceRecurrencesCommand(onlyCurrentMonth: true)),
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
