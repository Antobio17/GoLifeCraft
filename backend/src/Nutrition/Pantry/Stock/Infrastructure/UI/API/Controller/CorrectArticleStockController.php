<?php

namespace Nutrition\Pantry\Stock\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Movement\Application\Command\CorrectArticleStockCommand;
use Nutrition\Pantry\Movement\Domain\Exception\CorrectArticleStockException;
use Nutrition\Pantry\Movement\Domain\Exception\StockMovementException;
use Nutrition\Pantry\Movement\Domain\Model\StockCorrection;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CorrectArticleStockController
{
    use HandleTrait;

    public function __construct(MessageBusInterface $messageBus)
    {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new CorrectArticleStockCommand(
                articleId: $request->attributes->get(key: 'articleId'),
                kind: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'kind')
                    ?? StockCorrection::KIND_MEASURED,
                quantity: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'quantity'),
                unit: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'unit'),
                effectiveAt: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'effectiveAt'),
                correctedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CorrectArticleStockException::class => Response::HTTP_BAD_REQUEST,
                    StockMovementException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException|CorrectArticleStockException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
