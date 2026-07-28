<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\Controller;

use Nutrition\Menu\Menu\Application\Query\GetMenuShoppingNeedsQuery;
use Nutrition\Menu\Menu\Domain\Exception\GetMenuException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetMenuShoppingNeedsController
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
                querySingleResult: $this->handle(message: new GetMenuShoppingNeedsQuery(
                    menuId: $request->attributes->get(key: 'menuId'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetMenuException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
