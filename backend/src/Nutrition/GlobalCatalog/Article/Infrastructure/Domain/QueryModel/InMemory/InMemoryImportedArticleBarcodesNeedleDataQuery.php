<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\QueryModel\InMemory;

use Nutrition\GlobalCatalog\Article\Domain\QueryModel\ImportedArticleBarcodesNeedleDataQuery;

final class InMemoryImportedArticleBarcodesNeedleDataQuery implements ImportedArticleBarcodesNeedleDataQuery
{
    /**
     * @param string[] $barcodes
     */
    public function __construct(private array $barcodes = [])
    {
    }

    public function importedBarcodes(): array
    {
        return $this->barcodes;
    }
}
