<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticlesQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetGlobalArticlesController
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
            return JsonResponseBuilder::buildCollectionResponse(
                queryCollectionResult: $this->handle(message: new GetGlobalArticlesQuery(
                    pageNumber: RequestExtractor::getPageNumber(request: $request),
                    pageSize: RequestExtractor::getPageSize(request: $request),
                    filterName: RequestExtractor::getFilterParam(request: $request, filterName: 'name'),
                    orderBy: RequestExtractor::getOrderByParam(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
