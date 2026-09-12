<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\UI\API\Controller;

use Integration\Gemini\Client\Domain\Exception\GeminiThrottledException;
use Nutrition\Shopping\Ticket\Application\Query\GetTicketDraftQuery;
use Nutrition\Shopping\Ticket\Domain\Exception\GetTicketDraftException;
use Nutrition\Shopping\Ticket\Domain\Exception\TicketDraftQuotaException;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketDraftResult;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraft;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftLine;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftPhoto;
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

final class GetTicketDraftController
{
    use HandleTrait;

    private const string FIELD_NAME = 'photos';
    private const int MAX_PHOTOS = 4;
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
            /** @var GetTicketDraftResult $result */
            $result = $this->handle(message: new GetTicketDraftQuery(
                photos: $this->photos(request: $request),
                userSessionId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: ['data' => $this->toArray(result: $result)]);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    TicketDraftQuotaException::class => Response::HTTP_TOO_MANY_REQUESTS,
                    GetTicketDraftException::class => Response::HTTP_SERVICE_UNAVAILABLE,
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
     * @return TicketDraftPhoto[]
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
            callback: static fn (FileUploadedResult $image): TicketDraftPhoto => new TicketDraftPhoto(
                path: $image->tempPath,
                mimeType: $image->mimeType,
            ),
            array: $uploadedImages,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(GetTicketDraftResult $result): array
    {
        return [
            'fromCache' => $result->fromCache,
            'draft' => null !== $result->draft ? $this->draftToArray(draft: $result->draft) : null,
            'lowConfidenceFields' => $result->lowConfidenceFields,
            'notes' => $result->notes,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function draftToArray(TicketDraft $draft): array
    {
        return [
            'storeName' => $draft->storeName,
            'supermarketId' => $draft->supermarketId,
            'purchasedOn' => $draft->purchasedOn,
            'total' => $draft->total,
            'lines' => array_map(
                callback: static fn (TicketDraftLine $line): array => [
                    'rawName' => $line->rawName,
                    'quantity' => $line->quantity,
                    'rawUnit' => $line->rawUnit,
                    'unitPrice' => $line->unitPrice,
                    'totalPrice' => $line->totalPrice,
                ],
                array: $draft->lines,
            ),
        ];
    }
}
