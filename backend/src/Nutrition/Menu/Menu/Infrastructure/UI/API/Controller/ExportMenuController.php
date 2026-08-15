<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\Controller;

use Nutrition\Menu\Menu\Application\Query\ExportMenuQuery;
use Nutrition\Menu\Menu\Domain\Exception\ExportMenuException;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuDocumentResult;
use Nutrition\Menu\Menu\Domain\Service\DocumentTheme;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class ExportMenuController
{
    use HandleTrait;

    private const DEFAULT_LOCALE = 'es';
    private const SUPPORTED_LOCALES = ['es', 'en'];

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request): Response
    {
        try {
            /** @var MenuDocumentResult $document */
            $document = $this->handle(message: new ExportMenuQuery(
                menuId: $request->attributes->get(key: 'menuId'),
                locale: $this->resolveLocale(request: $request),
                theme: DocumentTheme::fromValue(theme: RequestExtractor::getStringQueryParam(
                    request: $request,
                    param: 'theme',
                    default: DocumentTheme::LIGHT->value,
                )),
            ));

            return new Response(
                content: $document->content,
                status: Response::HTTP_OK,
                headers: [
                    'Content-Type' => $document->mimeType,
                    'Content-Disposition' => HeaderUtils::makeDisposition(
                        disposition: HeaderUtils::DISPOSITION_ATTACHMENT,
                        filename: $document->fileName,
                    ),
                ],
            );
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    ExportMenuException::class => Response::HTTP_NOT_FOUND,
                ]
            );
        }
    }

    private function resolveLocale(Request $request): string
    {
        $locale = RequestExtractor::getStringQueryParam(request: $request, param: 'lang', default: self::DEFAULT_LOCALE);

        return in_array(needle: $locale, haystack: self::SUPPORTED_LOCALES, strict: true) ? $locale : self::DEFAULT_LOCALE;
    }
}
