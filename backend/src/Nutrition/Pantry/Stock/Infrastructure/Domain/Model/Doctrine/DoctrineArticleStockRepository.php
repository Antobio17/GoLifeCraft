<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStock;
use Nutrition\Pantry\Stock\Domain\Model\ArticleStockRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineArticleStockRepository extends EntityRepository implements ArticleStockRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findByArticleId(string $articleId): ?ArticleStock
    {
        return $this->findOneBy(['articleId' => $articleId]);
    }

    public function save(ArticleStock $articleStock): void
    {
        $this->getEntityManager()->persist(object: $articleStock);
    }

    public function delete(ArticleStock $articleStock): void
    {
        $this->getEntityManager()->remove(object: $articleStock);
    }
}
