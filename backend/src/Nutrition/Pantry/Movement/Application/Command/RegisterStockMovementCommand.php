<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class RegisterStockMovementCommand implements Command
{
    /**
     * @param array<int, array{quantity: float, unit: ?string}> $entries
     */
    public function __construct(
        public string $kind,
        public string $refId,
        public string $type,
        public string $effectiveAt,
        public array $entries,
        public string $sourceKind,
        public string $sourceId,
        public string $registeredByUserId,
    ) {
    }

    /**
     * @return array<int, array{quantity: float, unit: ?string}>
     */
    public static function singleEntry(float $quantity, ?string $unit = null): array
    {
        return [['quantity' => $quantity, 'unit' => $unit]];
    }

    public static function getName(): string
    {
        return 'golifecraft.nutrition.command.1.stock_movement.register';
    }
}
