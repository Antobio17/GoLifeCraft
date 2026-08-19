<?php

namespace Economy\Finance\Transaction\Infrastructure\UI\API\Controller;

use Economy\Finance\Transaction\Application\Command\UpdateFinanceTransactionCommand;
use Economy\Finance\Transaction\Domain\Exception\UpdateFinanceTransactionException;
use Economy\Finance\Transaction\Domain\Model\FinanceTransaction;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateFinanceTransactionController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $financeTransactionId): JsonResponse
    {
        try {
            $this->handle(message: new UpdateFinanceTransactionCommand(
                financeTransactionId: $financeTransactionId,
                accountId: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'accountId'),
                transactionDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'transactionDate'),
                kind: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'kind'),
                amount: (float) RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'amount'),
                category: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'category', required: false)
                    ?: FinanceTransaction::CATEGORY_OTHER,
                note: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'note', required: false),
                store: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'store'),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateFinanceTransactionException::class => Response::HTTP_BAD_REQUEST,
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
