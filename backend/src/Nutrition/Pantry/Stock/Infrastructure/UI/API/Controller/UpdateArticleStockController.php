<?php

namespace Nutrition\Pantry\Stock\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Movement\Application\Command\RegisterStockMovementCommand;
use Nutrition\Pantry\Movement\Domain\Exception\StockMovementException;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateArticleStockController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly DateTimeGenerator $dateTimeGenerator,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $articleId = $request->attributes->get(key: 'articleId');

            $this->handle(message: new RegisterStockMovementCommand(
                kind: StockMovement::KIND_ARTICLE,
                refId: $articleId,
                type: StockMovement::TYPE_COUNT,
                effectiveAt: $this->dateTimeGenerator->now()->format(format: 'Y-m-d H:i:s'),
                entries: RegisterStockMovementCommand::singleEntry(
                    quantity: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'quantity'),
                ),
                sourceKind: StockMovement::SOURCE_MANUAL,
                sourceId: $articleId,
                registeredByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    StockMovementException::class => Response::HTTP_BAD_REQUEST,
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
