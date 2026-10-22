<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\GlobalCatalog\Article\Domain\QueryModel\ImportedArticleBarcodesNeedleDataQuery;

final readonly class DoctrineImportedArticleBarcodesNeedleDataQuery implements ImportedArticleBarcodesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function importedBarcodes(): array
    {
        return $this->connection->createQueryBuilder()
            ->select('DISTINCT a.barcode')
            ->from(table: 'article', alias: 'a')
            ->where('a.barcode IS NOT NULL')
            ->andWhere("a.barcode <> ''")
            ->executeQuery()
            ->fetchFirstColumn();
    }
}
