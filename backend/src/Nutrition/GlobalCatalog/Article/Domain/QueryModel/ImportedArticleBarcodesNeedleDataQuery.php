<?php

namespace Nutrition\GlobalCatalog\Article\Domain\QueryModel;

interface ImportedArticleBarcodesNeedleDataQuery
{
    /**
     * @return string[]
     */
    public function importedBarcodes(): array;
}
