<?php

namespace Nutrition\GlobalCatalog\Article\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineGlobalArticleRepository extends EntityRepository implements GlobalArticleRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?GlobalArticle
    {
        return $this->getEntityManager()->find(className: GlobalArticle::class, id: $id);
    }

    public function findByBarcode(string $barcode): ?GlobalArticle
    {
        return $this->findOneBy(['barcode' => $barcode]);
    }

    public function save(GlobalArticle $globalArticle): void
    {
        $this->getEntityManager()->persist(object: $globalArticle);
    }
}
