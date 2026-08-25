<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\Controller;

use Integration\Gemini\Client\Domain\Exception\GeminiThrottledException;
use Nutrition\Catalog\Article\Application\Query\GetArticleDraftQuery;
use Nutrition\Catalog\Article\Domain\Exception\ArticleDraftQuotaException;
use Nutrition\Catalog\Article\Domain\Exception\GetArticleDraftException;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraft;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftNutrition;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftPhoto;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleDraftResult;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\FileUploadedResult;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class GetArticleDraftController
{
    use HandleTrait;

    private const string FIELD_NAME = 'photos';
    private const int MAX_PHOTOS = 3;
    private const int MAX_BYTES = 6291456;
    private const array ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
    ];

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            /** @var GetArticleDraftResult $result */
            $result = $this->handle(message: new GetArticleDraftQuery(
                photos: $this->photos(request: $request),
                userSessionId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: ['data' => $this->toArray(result: $result)]);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ArticleDraftQuotaException::class => Response::HTTP_TOO_MANY_REQUESTS,
                    GetArticleDraftException::class => Response::HTTP_SERVICE_UNAVAILABLE,
                    GeminiThrottledException::class => Response::HTTP_SERVICE_UNAVAILABLE,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }

    /**
     * @return ArticleDraftPhoto[]
     */
    private function photos(Request $request): array
    {
        $uploadedImages = RequestExtractor::getUploadedImages(
            request: $request,
            fieldName: self::FIELD_NAME,
            maxFiles: self::MAX_PHOTOS,
            allowedMimeTypes: self::ALLOWED_MIME_TYPES,
            maxBytes: self::MAX_BYTES,
        );

        return array_map(
            callback: static fn (FileUploadedResult $image): ArticleDraftPhoto => new ArticleDraftPhoto(
                path: $image->tempPath,
                mimeType: $image->mimeType,
            ),
            array: $uploadedImages,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(GetArticleDraftResult $result): array
    {
        return [
            'source' => $result->source->value,
            'barcode' => $result->barcode,
            'globalArticleId' => $result->globalArticleId,
            'draft' => null !== $result->draft ? $this->draftToArray(draft: $result->draft) : null,
            'lowConfidenceFields' => $result->lowConfidenceFields,
            'notes' => $result->notes,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function draftToArray(ArticleDraft $draft): array
    {
        return [
            'name' => $draft->name,
            'brand' => $draft->brand,
            'emoji' => $draft->emoji,
            'price' => $draft->price,
            'categoryId' => $draft->categoryId,
            'supermarketId' => $draft->supermarketId,
            'aisleId' => $draft->aisleId,
            'quantity' => $draft->quantity,
            'baseUnit' => $draft->baseUnit,
            'recipeUnit' => $draft->recipeUnit,
            'diaryUnit' => $draft->diaryUnit,
            'packUnit' => $draft->packUnit,
            'equivalences' => array_map(
                callback: static fn ($equivalence): array => [
                    'unit' => $equivalence->unit,
                    'quantity' => $equivalence->quantity,
                ],
                array: $draft->equivalences,
            ),
            'nutrition' => null !== $draft->nutrition ? $this->nutritionToArray(nutrition: $draft->nutrition) : null,
        ];
    }

    /**
     * @return array<string, float|null>
     */
    private function nutritionToArray(ArticleDraftNutrition $nutrition): array
    {
        return [
            'referenceAmount' => $nutrition->referenceAmount,
            'calories' => $nutrition->calories,
            'protein' => $nutrition->protein,
            'carbs' => $nutrition->carbs,
            'sugars' => $nutrition->sugars,
            'fat' => $nutrition->fat,
            'saturatedFat' => $nutrition->saturatedFat,
            'fiber' => $nutrition->fiber,
            'salt' => $nutrition->salt,
        ];
    }
}
