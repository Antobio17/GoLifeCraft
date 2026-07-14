<?php

namespace Nutrition\Recipe\Recipe\Infrastructure\UI\API\Controller;

use Nutrition\Recipe\Recipe\Application\Command\RecipeIngredientData;
use Nutrition\Recipe\Recipe\Application\Command\UpdateRecipeCommand;
use Nutrition\Recipe\Recipe\Domain\Exception\UpdateRecipeException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateRecipeController
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
            $this->handle(message: new UpdateRecipeCommand(
                recipeId: $request->attributes->get(key: 'recipeId'),
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                emoji: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'emoji'),
                category: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'category'),
                servings: RequestExtractor::getIntRequestValue(request: $request, fieldName: 'servings'),
                ingredients: RecipeIngredientData::listFromArray(
                    rawIngredients: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'ingredients'),
                ),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateRecipeException::class => Response::HTTP_BAD_REQUEST,
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
