<?php

namespace Nutrition\GlobalCatalog\Article\Domain\Model;

interface GlobalArticleRepository
{
    public function nextId(): string;

    public function findById(string $id): ?GlobalArticle;

    public function findByBarcode(string $barcode): ?GlobalArticle;

    public function save(GlobalArticle $globalArticle): void;
}
