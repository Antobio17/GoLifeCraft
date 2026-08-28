<?php

namespace Nutrition\Kitchen\Production\Infrastructure\UI\API\Controller;

use Nutrition\Kitchen\Production\Application\Query\GetProductionItemQuery;
use Nutrition\Kitchen\Production\Domain\Exception\GetProductionException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetProductionItemController
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
            return JsonResponseBuilder::buildSingleResponse(
                querySingleResult: $this->handle(message: new GetProductionItemQuery(
                    productionId: $request->attributes->get(key: 'productionId'),
                    itemId: $request->attributes->get(key: 'itemId'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetProductionException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
