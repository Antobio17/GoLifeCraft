<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\Model\InMemory;

use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleRepository;
use Ramsey\Uuid\Uuid;

final class InMemoryGlobalArticleRepository implements GlobalArticleRepository
{
    /** @var array<string, GlobalArticle> */
    private array $globalArticles = [];

    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?GlobalArticle
    {
        return $this->globalArticles[$id] ?? null;
    }

    public function findByBarcode(string $barcode): ?GlobalArticle
    {
        foreach ($this->globalArticles as $globalArticle) {
            if ($globalArticle->barcode === $barcode) {
                return $globalArticle;
            }
        }

        return null;
    }

    public function save(GlobalArticle $globalArticle): void
    {
        $this->globalArticles[$globalArticle->id] = $globalArticle;
    }
}
