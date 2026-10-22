<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\GlobalCatalog\Article\Application\Command\UpdateGlobalArticleCommand;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleAccessException;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateGlobalArticleController
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
            $this->handle(message: new UpdateGlobalArticleCommand(
                globalArticleId: $request->attributes->get(key: 'globalArticleId'),
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                brand: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'brand'),
                categoryName: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'categoryName'),
                quantity: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'quantity'),
                price: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'price', required: false),
                previousPrice: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'previousPrice', required: false),
                referencePrice: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'referencePrice', required: false),
                referenceFormat: RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'referenceFormat'),
                calories: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'calories', required: false),
                protein: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'protein', required: false),
                carbs: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'carbs', required: false),
                sugars: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'sugars', required: false),
                fat: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'fat', required: false),
                saturatedFat: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'saturatedFat', required: false),
                fiber: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'fiber', required: false),
                salt: RequestExtractor::getFloatRequestValue(request: $request, fieldName: 'salt', required: false),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
                userRole: RequestExtractor::getUserRole(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateGlobalArticleAccessException::class => Response::HTTP_FORBIDDEN,
                    UpdateGlobalArticleException::class => Response::HTTP_BAD_REQUEST,
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
