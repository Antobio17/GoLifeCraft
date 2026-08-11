<?php

namespace Nutrition\Catalog\Supermarket\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateSupermarketAislesCommand implements Command
{
    /**
     * @param SupermarketAisleData[] $aisles
     */
    public function __construct(
        public string $supermarketId,
        public array $aisles,
        public string $updatedByUserId,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.supermarket.aisles.update';
    }
}
