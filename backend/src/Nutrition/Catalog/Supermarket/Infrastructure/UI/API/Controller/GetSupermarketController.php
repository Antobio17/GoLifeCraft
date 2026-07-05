<?php

namespace Nutrition\Catalog\Supermarket\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Supermarket\Application\Query\GetSupermarketQuery;
use Nutrition\Catalog\Supermarket\Domain\Exception\GetSupermarketException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetSupermarketController
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
                querySingleResult: $this->handle(message: new GetSupermarketQuery(
                    supermarketId: $request->attributes->get(key: 'supermarketId'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetSupermarketException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
