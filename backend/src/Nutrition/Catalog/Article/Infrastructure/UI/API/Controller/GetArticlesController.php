<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Article\Application\Query\GetArticlesQuery;
use Psr\Log\LoggerInterface;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Logger\ExceptionLogger;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetArticlesController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
        private LoggerInterface $logger,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            return JsonResponseBuilder::buildCollectionResponse(
                queryCollectionResult: $this->handle(message: new GetArticlesQuery(
                    pageNumber: RequestExtractor::getPageNumber(request: $request),
                    pageSize: RequestExtractor::getPageSize(request: $request),
                    filterName: RequestExtractor::getFilterParam(request: $request, filterName: 'name'),
                    orderBy: RequestExtractor::getOrderByParam(request: $request),
                )),
            );
        } catch (HandlerFailedException $e) {
            ExceptionLogger::log(logger: $this->logger, exception: $e, controller: self::class);

            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
