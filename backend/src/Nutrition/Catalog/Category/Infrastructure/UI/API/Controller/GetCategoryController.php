<?php

namespace Nutrition\Catalog\Category\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Category\Application\Query\GetCategoryQuery;
use Nutrition\Catalog\Category\Domain\Exception\GetCategoryException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetCategoryController
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
                querySingleResult: $this->handle(message: new GetCategoryQuery(
                    categoryId: $request->attributes->get(key: 'categoryId'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetCategoryException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
