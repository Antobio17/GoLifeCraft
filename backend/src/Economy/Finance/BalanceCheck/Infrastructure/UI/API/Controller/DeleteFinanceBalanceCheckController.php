<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\UI\API\Controller;

use Economy\Finance\BalanceCheck\Application\Command\DeleteFinanceBalanceCheckCommand;
use Economy\Finance\BalanceCheck\Domain\Exception\DeleteFinanceBalanceCheckException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DeleteFinanceBalanceCheckController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $financeBalanceCheckId): JsonResponse
    {
        try {
            $this->handle(message: new DeleteFinanceBalanceCheckCommand(
                financeBalanceCheckId: $financeBalanceCheckId,
                deletedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    DeleteFinanceBalanceCheckException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        }
    }
}
