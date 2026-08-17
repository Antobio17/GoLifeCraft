<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\UI\API\Controller;

use Economy\Finance\BalanceCheck\Application\Query\GetFinanceBalanceChecksQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetFinanceBalanceChecksController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $accountId = RequestExtractor::getStringQueryParam(request: $request, param: 'accountId');

        try {
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetFinanceBalanceChecksQuery(
                    financeAccountId: '' === (string) $accountId ? null : $accountId,
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
