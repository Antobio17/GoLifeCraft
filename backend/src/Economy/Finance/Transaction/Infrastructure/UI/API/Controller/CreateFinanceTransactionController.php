<?php

namespace Economy\Finance\Transaction\Infrastructure\UI\API\Controller;

use Economy\Finance\Transaction\Application\Command\CreateFinanceTransactionCommand;
use Economy\Finance\Transaction\Domain\Exception\CreateFinanceTransactionException;
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

final class CreateFinanceTransactionController
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
            $this->handle(message: new CreateFinanceTransactionCommand(
                transactionDate: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'transactionDate'),
                kind: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'kind'),
                amount: (float) RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'amount'),
                category: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'category', required: false)
                    ?: FinanceTransaction::CATEGORY_OTHER,
                note: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'note', required: false),
                store: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'store'),
                recurring: (bool) RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'recurring', required: false, nullable: false),
                source: FinanceTransaction::SOURCE_MANUAL,
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateFinanceTransactionException::class => Response::HTTP_BAD_REQUEST,
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
