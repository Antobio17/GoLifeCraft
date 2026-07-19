<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Article\Application\Command\ArticleNutritionData;
use Nutrition\Catalog\Article\Application\Command\CreateArticleCommand;
use Nutrition\Catalog\Article\Domain\Exception\CreateArticleException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class CreateArticleController
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
            $this->handle(message: new CreateArticleCommand(
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                recipeUnit: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'recipeUnit') ?? 'gram',
                servingSize: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'servingSize', required: false),
                price: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'price', required: false),
                brand: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'brand'),
                emoji: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'emoji'),
                categoryId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'categoryId'),
                supermarketId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'supermarketId'),
                nutrition: ArticleNutritionData::fromArray(
                    rawNutrition: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'nutrition', required: false) ?? [],
                ),
                createdByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_CREATED);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    CreateArticleException::class => Response::HTTP_BAD_REQUEST,
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
