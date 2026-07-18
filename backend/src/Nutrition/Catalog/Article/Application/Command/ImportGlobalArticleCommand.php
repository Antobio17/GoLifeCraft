<?php

namespace Nutrition\Catalog\Article\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class ImportGlobalArticleCommand implements Command
{
    public function __construct(
        public string $globalArticleId,
        public string $importedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.article.import_global';
    }
}
