<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\GlobalCatalog\Article\Application\Query\GetGlobalArticleFacetsQuery;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GetGlobalArticleFacetsResult;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\Dto\GlobalArticleCategoryCount;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetGlobalArticleFacetsController
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
            /** @var GetGlobalArticleFacetsResult $result */
            $result = $this->handle(message: new GetGlobalArticleFacetsQuery(
                filterSource: RequestExtractor::getFilterParam(request: $request, filterName: 'source'),
            ));

            return new JsonResponse(data: [
                'data' => [
                    'categories' => array_map(
                        callback: static fn (GlobalArticleCategoryCount $category): string => $category->name,
                        array: $result->categories,
                    ),
                    'categoryCounts' => array_map(
                        callback: static fn (GlobalArticleCategoryCount $category): array => [
                            'name' => $category->name,
                            'count' => $category->count,
                        ],
                        array: $result->categories,
                    ),
                ],
            ]);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: []
            );
        }
    }
}
