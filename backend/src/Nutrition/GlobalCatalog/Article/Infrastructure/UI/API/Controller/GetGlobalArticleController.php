<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticleQuery;
use Nutrition\GlobalCatalog\Article\Domain\Exception\GetGlobalArticleException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetGlobalArticleController
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
                querySingleResult: $this->handle(message: new GetGlobalArticleQuery(
                    globalArticleId: $request->attributes->get(key: 'globalArticleId'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetGlobalArticleException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
