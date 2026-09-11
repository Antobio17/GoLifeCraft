<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\Controller;

use Nutrition\Shopping\Ticket\Application\Query\GetTicketsQuery;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetTicketsController
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
                queryCollectionResult: $this->handle(message: new GetTicketsQuery(
                    pageNumber: RequestExtractor::getPageNumber(request: $request),
                    pageSize: RequestExtractor::getPageSize(request: $request),
                    filterStatus: RequestExtractor::getFilterParam(request: $request, filterName: 'status'),
                    filterSearch: RequestExtractor::getFilterParam(request: $request, filterName: 'search'),
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
