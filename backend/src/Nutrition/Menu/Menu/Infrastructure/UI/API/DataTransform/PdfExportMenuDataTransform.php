<?php

namespace Nutrition\Menu\Menu\Infrastructure\UI\API\DataTransform;

use Nutrition\Menu\Menu\Application\Query\ExportMenuDataTransform;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\MenuDocumentResult;
use Nutrition\Menu\Menu\Domain\Service\DocumentTheme;
use Nutrition\Menu\Menu\Domain\Service\MenuDocumentRenderer;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class PdfExportMenuDataTransform implements ExportMenuDataTransform
{
    private const FALLBACK_FILE_NAME = 'menu';

    public function __construct(
        private MenuDocumentRenderer $menuDocumentRenderer,
    ) {
    }

    public function transform(ExportMenuResult $menu, string $locale, DocumentTheme $theme): QueryResult
    {
        return new MenuDocumentResult(
            fileName: $this->buildFileName(name: $menu->name),
            mimeType: 'application/pdf',
            content: $this->menuDocumentRenderer->render(menu: $menu, locale: $locale, theme: $theme),
        );
    }

    private function buildFileName(string $name): string
    {
        $ascii = (string) iconv(from_encoding: 'UTF-8', to_encoding: 'ASCII//TRANSLIT', string: $name);
        $slug = trim(string: (string) preg_replace(pattern: '/[^a-z0-9]+/', replacement: '-', subject: strtolower(string: $ascii)), characters: '-');

        return ('' === $slug ? self::FALLBACK_FILE_NAME : $slug).'.pdf';
    }
}
