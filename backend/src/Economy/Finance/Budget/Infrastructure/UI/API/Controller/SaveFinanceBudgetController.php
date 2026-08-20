<?php

namespace Economy\Finance\Budget\Infrastructure\UI\API\Controller;

use Economy\Finance\Budget\Application\Command\FinanceBudgetCategoryData;
use Economy\Finance\Budget\Application\Command\SaveFinanceBudgetCommand;
use Economy\Finance\Budget\Domain\Exception\SaveFinanceBudgetException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class SaveFinanceBudgetController
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
            $this->handle(message: new SaveFinanceBudgetCommand(
                referenceIncome: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'referenceIncome'),
                savingsPercentage: (float) RequestExtractor::getFloatRequestValue(
                    request: $request,
                    fieldName: 'savingsPercentage',
                    required: false,
                ),
                categories: FinanceBudgetCategoryData::listFromArray(
                    rawCategories: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'categories'),
                ),
                savedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    SaveFinanceBudgetException::class => Response::HTTP_BAD_REQUEST,
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
