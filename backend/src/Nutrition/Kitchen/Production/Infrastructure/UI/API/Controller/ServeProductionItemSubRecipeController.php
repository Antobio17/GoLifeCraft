<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\Controller;

use Nutrition\Kitchen\Production\Application\Command\ServeProductionItemSubRecipeCommand;
use Nutrition\Kitchen\Production\Domain\Exception\AdjustProductionItemException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class ServeProductionItemSubRecipeController
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
            $this->handle(message: new ServeProductionItemSubRecipeCommand(
                productionId: $request->attributes->get(key: 'productionId'),
                itemId: $request->attributes->get(key: 'itemId'),
                subRecipeId: $request->attributes->get(key: 'subRecipeId'),
                sourceProductionItemId: RequestExtractor::getNullableStringRequestValue(
                    request: $request,
                    fieldName: 'sourceProductionItemId',
                ),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_OK);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    AdjustProductionItemException::class => Response::HTTP_BAD_REQUEST,
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
