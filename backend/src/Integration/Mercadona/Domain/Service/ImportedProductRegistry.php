<?php

namespace Integration\Mercadona\Domain\Service;

interface ImportedProductRegistry
{
    public function isImported(string $barcode): bool;
}
