<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Article\Application\Query\GetArticleQuery;
use Nutrition\Catalog\Article\Domain\Exception\GetArticleException;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetArticleImageController
{
    use HandleTrait;

    private const string IMAGE_AGGREGATE = 'article';

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly ImageStorageService $imageStorageService,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): Response
    {
        $articleId = $request->attributes->get(key: 'articleId');

        try {
            /** @var QuerySingleResult $result */
            $result = $this->handle(message: new GetArticleQuery(articleId: $articleId));
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetArticleException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }

        /** @var GetArticleResult $article */
        $article = $result->item;

        if (null === $article->image) {
            return new Response(status: Response::HTTP_NOT_FOUND);
        }

        $path = $this->imageStorageService->aggregateImagePath(
            aggregate: self::IMAGE_AGGREGATE,
            aggregateId: $articleId,
            image: $article->image,
        );

        if (null === $path) {
            return new Response(status: Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse(file: $path);
        $response->setPrivate();
        $response->setMaxAge(365 * 24 * 3600);

        return $response;
    }
}
