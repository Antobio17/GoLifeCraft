<?php

namespace Nutrition\Pantry\Stock\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Stock\Application\Command\SetArticleStockTrackingCommand;
use Nutrition\Pantry\Stock\Domain\Exception\SetArticleStockTrackingException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class SetArticleStockTrackingController
{
    use HandleTrait;

    public function __construct(MessageBusInterface $messageBus)
    {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new SetArticleStockTrackingCommand(
                articleId: $request->attributes->get(key: 'articleId'),
                trackingMode: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'trackingMode'),
                referenceQuantity: RequestExtractor::getFloatRequestValue(
                    request: $request,
                    fieldName: 'referenceQuantity',
                    required: false,
                ),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    SetArticleStockTrackingException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException|SetArticleStockTrackingException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
