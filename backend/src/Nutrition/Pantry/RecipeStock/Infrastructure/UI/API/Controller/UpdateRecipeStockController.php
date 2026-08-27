<?php

namespace Nutrition\Pantry\RecipeStock\Infrastructure\UI\API\Controller;

use Nutrition\Pantry\RecipeStock\Application\Command\UpdateRecipeStockCommand;
use Nutrition\Pantry\RecipeStock\Domain\Exception\RecipeStockException;
use Nutrition\Pantry\RecipeStock\Domain\Exception\UpdateRecipeStockException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateRecipeStockController
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
            $this->handle(message: new UpdateRecipeStockCommand(
                recipeId: $request->attributes->get(key: 'recipeId'),
                servings: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'servings'),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateRecipeStockException::class => Response::HTTP_NOT_FOUND,
                    RecipeStockException::class => Response::HTTP_BAD_REQUEST,
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
