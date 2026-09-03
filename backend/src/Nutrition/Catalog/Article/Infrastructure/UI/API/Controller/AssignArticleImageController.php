<?php

namespace Nutrition\Catalog\Article\Infrastructure\UI\API\Controller;

use Nutrition\Catalog\Article\Application\Command\AssignArticleImageCommand;
use Nutrition\Catalog\Article\Domain\Exception\AssignArticleImageException;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class AssignArticleImageController
{
    use HandleTrait;

    private const string FIELD_NAME = 'image';
    private const int MAX_BYTES = 6291456;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $this->handle(message: new AssignArticleImageCommand(
                articleId: $request->attributes->get(key: 'articleId'),
                imagePath: $this->imagePath(request: $request),
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    AssignArticleImageException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }

    private function imagePath(Request $request): ?string
    {
        if (Request::METHOD_DELETE === $request->getMethod()) {
            return null;
        }

        return RequestExtractor::getUploadedImagePath(
            request: $request,
            fieldName: self::FIELD_NAME,
            maxBytes: self::MAX_BYTES,
        );
    }
}
