<?php

namespace Nutrition\Menu\Menu\Application\Query;

use Nutrition\Menu\Menu\Domain\Service\DocumentTheme;
use Shared\Shared\Shared\Application\Query\Query;

final readonly class ExportMenuQuery implements Query
{
    public function __construct(
        public string $menuId,
        public string $locale,
        public DocumentTheme $theme,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.query.1.menu.export';
    }
}
