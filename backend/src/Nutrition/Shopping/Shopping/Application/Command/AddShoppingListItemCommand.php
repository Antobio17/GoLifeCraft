<?php

namespace Nutrition\Shopping\Shopping\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class AddShoppingListItemCommand implements Command
{
    public function __construct(
        public string $articleId,
        public int $quantity,
        public string $createdByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.shopping_list_item.add';
    }
}
