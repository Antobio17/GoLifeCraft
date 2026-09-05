<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\RecipeStock\Application\Command\MoveRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Domain\Exception\MoveRecipeStockException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class MoveRecipeStockController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $recipeId): JsonResponse
    {
        try {
            $this->handle(message: new MoveRecipeStockCommand(
                recipeId: $recipeId,
                locationId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'locationId'),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    MoveRecipeStockException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
