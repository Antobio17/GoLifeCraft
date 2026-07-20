<?php

namespace Nutrition\Shopping\Shopping\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class DeleteShoppingListItemCommand implements Command
{
    public function __construct(
        public string $shoppingListItemId,
        public string $deletedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.shopping_list_item.delete';
    }
}
