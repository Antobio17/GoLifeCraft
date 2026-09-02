<?php

namespace Shared\Tool\Tool\Infrastructure\UI\API\Controller;

use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class UploadImageController
{
    private const string FIELD_NAME = 'image';
    private const int MAX_BYTES = 6291456;
    private const array EXTENSIONS_BY_MIME_TYPE = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    private const array ALLOWED_FOLDERS = ['article', 'recipe'];
    private const string DEFAULT_FOLDER = 'article';

    public function __construct(
        private ImageStorageService $imageStorageService,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $images = RequestExtractor::getUploadedImages(
                request: $request,
                fieldName: self::FIELD_NAME,
                maxFiles: 1,
                allowedMimeTypes: array_keys(self::EXTENSIONS_BY_MIME_TYPE),
                maxBytes: self::MAX_BYTES,
            );

            $imageUrl = $this->imageStorageService->storePublicImage(
                folder: $this->folder(request: $request),
                imagePath: $images[0]->tempPath,
                extension: self::EXTENSIONS_BY_MIME_TYPE[$images[0]->mimeType],
            );

            return new JsonResponse(data: ['data' => ['url' => $imageUrl]], status: Response::HTTP_CREATED);
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }

    private function folder(Request $request): string
    {
        $folder = RequestExtractor::getNullableStringRequestValue(request: $request, fieldName: 'folder');

        if (!in_array($folder, self::ALLOWED_FOLDERS, true)) {
            return self::DEFAULT_FOLDER;
        }

        return $folder;
    }
}
