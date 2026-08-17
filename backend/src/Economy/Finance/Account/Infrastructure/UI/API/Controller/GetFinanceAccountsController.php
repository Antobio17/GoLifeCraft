<?php

namespace Economy\Finance\Account\Infrastructure\UI\API\Controller;

use Economy\Finance\Account\Application\Query\GetFinanceAccountsQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetFinanceAccountsController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $today = (new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: 'Europe/Madrid')))
            ->format(format: 'Y-m-d');

        try {
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetFinanceAccountsQuery(date: $today)),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
