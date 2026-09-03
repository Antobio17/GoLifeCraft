<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Article\Application\Command\ArticleEquivalenceData;
use Nutrition\Catalog\Article\Application\Command\ArticleNutritionData;
use Nutrition\Catalog\Article\Application\Command\UpdateArticleCommand;
use Nutrition\Catalog\Article\Domain\Exception\UpdateArticleException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateArticleController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $baseUnit = RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'baseUnit') ?? Article::BASE_UNIT_GRAM;

        try {
            $this->handle(message: new UpdateArticleCommand(
                articleId: $request->attributes->get(key: 'articleId'),
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                recipeUnit: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'recipeUnit') ?? $baseUnit,
                baseUnit: $baseUnit,
                diaryUnit: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'diaryUnit') ?? $baseUnit,
                packUnit: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'packUnit'),
                price: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'price', required: false),
                brand: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'brand'),
                emoji: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'emoji'),
                categoryId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'categoryId'),
                supermarketId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'supermarketId'),
                aisleId: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'aisleId'),
                nutrition: ArticleNutritionData::fromArray(
                    rawNutrition: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'nutrition', required: false) ?? [],
                ),
                equivalences: ArticleEquivalenceData::listFromArray(
                    rawEquivalences: RequestExtractor::getArrayRequestValue(request: $request, fieldName: 'equivalences', required: false) ?? [],
                ),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateArticleException::class => Response::HTTP_BAD_REQUEST,
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
