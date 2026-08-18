<?php

namespace Economy\Finance\Recurrence\Infrastructure\UI\API\Controller;

use Economy\Finance\Recurrence\Application\Command\CreateFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Domain\Exception\CreateFinanceRecurrenceException;
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

final class CreateFinanceRecurrenceController
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
            $this->handle(message: new CreateFinanceRecurrenceCommand(
                accountId: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'accountId'),
                kind: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'kind'),
                amount: (float) RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'amount'),
                category: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'category', required: false)
                    ?: FinanceTransaction::CATEGORY_OTHER,
                note: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'note', required: false),
                store: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'store'),
                dayOfMonth: (int) RequestExtractor::getIntRequestValue(request: $request, fieldName: 'dayOfMonth'),
                startMonth: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'startMonth'),
                endMonth: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'endMonth'),
                active: RequestExtractor::getBooleanRequestValue(request: $request, fieldName: 'active', required: false) ?? true,
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateFinanceRecurrenceException::class => Response::HTTP_BAD_REQUEST,
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
