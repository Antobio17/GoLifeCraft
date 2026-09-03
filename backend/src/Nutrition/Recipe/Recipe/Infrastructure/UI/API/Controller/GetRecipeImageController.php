<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\UI\API\Controller;

use Nutrition\Recipe\Recipe\Application\Query\GetRecipeQuery;
use Nutrition\Recipe\Recipe\Domain\Exception\GetRecipeException;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\GetRecipeResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetRecipeImageController
{
    use HandleTrait;

    private const string IMAGE_AGGREGATE = 'recipe';

    public function __construct(
        MessageBusInterface $messageBus,
        private readonly ImageStorageService $imageStorageService,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): Response
    {
        $recipeId = $request->attributes->get(key: 'recipeId');

        try {
            /** @var QuerySingleResult $result */
            $result = $this->handle(message: new GetRecipeQuery(recipeId: $recipeId));
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    GetRecipeException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }

        /** @var GetRecipeResult $recipe */
        $recipe = $result->item;

        if (null === $recipe->image) {
            return new Response(status: Response::HTTP_NOT_FOUND);
        }

        $path = $this->imageStorageService->aggregateImagePath(
            aggregate: self::IMAGE_AGGREGATE,
            aggregateId: $recipeId,
            image: $recipe->image,
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
