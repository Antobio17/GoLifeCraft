<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Integration\Mercadona\Domain\Service\MissingPriceRegistry;

final readonly class DbalMissingPriceRegistry implements MissingPriceRegistry
{
    public function __construct(
        private Connection $connection,
    ) {
    }

    public function needsPricing(string $barcode): bool
    {
        $count = $this->connection->fetchOne(
            'SELECT COUNT(*) FROM global_article WHERE barcode = :barcode AND price IS NULL',
            ['barcode' => $barcode],
        );

        return (int) $count > 0;
    }

    public function isKnown(string $barcode): bool
    {
        $count = $this->connection->fetchOne(
            'SELECT COUNT(*) FROM global_article WHERE barcode = :barcode',
            ['barcode' => $barcode],
        );

        return (int) $count > 0;
    }

    public function countMissingPricing(): int
    {
        return (int) $this->connection->fetchOne(
            'SELECT COUNT(*) FROM global_article WHERE price IS NULL',
        );
    }
}
