<?php

namespace Nutrition\Pantry\Location\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\Location\Application\Query\GetLocationCandidatesQuery;
use Nutrition\Pantry\Location\Domain\Exception\GetLocationException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetLocationCandidatesController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $locationId): JsonResponse
    {
        try {
            return JsonResponseBuilder::buildCollectionResponse(
                queryCollectionResult: $this->handle(message: new GetLocationCandidatesQuery(
                    locationId: $locationId,
                    pageNumber: RequestExtractor::getPageNumber(request: $request),
                    pageSize: RequestExtractor::getPageSize(request: $request),
                    filterName: RequestExtractor::getFilterParam(request: $request, filterName: 'name'),
                    filterKind: RequestExtractor::getFilterParam(request: $request, filterName: 'kind'),
                )),
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetLocationException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }
}
