<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Integration\Mercadona\Domain\Service\ImportedProductRegistry;

final readonly class DbalImportedProductRegistry implements ImportedProductRegistry
{
    private const string SOURCE = 'mercadona';

    public function __construct(
        private Connection $connection,
    ) {
    }

    public function isImported(string $barcode): bool
    {
        $count = $this->connection->fetchOne(
            'SELECT COUNT(*) FROM global_article WHERE barcode = :barcode AND source = :source AND calories IS NOT NULL AND protein IS NOT NULL AND carbs IS NOT NULL AND fat IS NOT NULL',
            [
                'barcode' => $barcode,
                'source' => self::SOURCE,
            ],
        );

        return (int) $count > 0;
    }
}
