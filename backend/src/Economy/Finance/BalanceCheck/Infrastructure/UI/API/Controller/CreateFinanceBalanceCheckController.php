<?php

namespace Economy\Finance\BalanceCheck\Infrastructure\UI\API\Controller;

use Economy\Finance\BalanceCheck\Application\Command\CreateFinanceBalanceCheckCommand;
use Economy\Finance\BalanceCheck\Domain\Exception\CreateFinanceBalanceCheckException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateFinanceBalanceCheckController
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
            $this->handle(message: new CreateFinanceBalanceCheckCommand(
                accountId: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'accountId'),
                checkDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'checkDate'),
                amount: (float) RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'amount'),
                note: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'note', required: false),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateFinanceBalanceCheckException::class => Response::HTTP_BAD_REQUEST,
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
