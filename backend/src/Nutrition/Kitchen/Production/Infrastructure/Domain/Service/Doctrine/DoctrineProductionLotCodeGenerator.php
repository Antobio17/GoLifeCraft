<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Service\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Kitchen\Production\Domain\Service\ProductionLotCodeGenerator;

final readonly class DoctrineProductionLotCodeGenerator implements ProductionLotCodeGenerator
{
    private const string PREFIX = 'L-';

    private const int PAD_LENGTH = 3;

    public function __construct(private Connection $connection)
    {
    }

    public function next(): string
    {
        $highest = $this->connection->fetchOne(
            query: 'SELECT MAX(CAST(SUBSTRING(code, :offset) AS UNSIGNED)) FROM production_item WHERE code LIKE :pattern',
            params: ['offset' => strlen(string: self::PREFIX) + 1, 'pattern' => self::PREFIX.'%'],
        );

        return self::PREFIX.str_pad(
            string: (string) (((int) $highest) + 1),
            length: self::PAD_LENGTH,
            pad_string: '0',
            pad_type: \STR_PAD_LEFT,
        );
    }
}
