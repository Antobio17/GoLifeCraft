<?php

namespace Nutrition\Menu\Menu\Domain\Service;

use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;

interface MenuDocumentRenderer
{
    public function render(ExportMenuResult $menu, string $locale, DocumentTheme $theme): string;
}
