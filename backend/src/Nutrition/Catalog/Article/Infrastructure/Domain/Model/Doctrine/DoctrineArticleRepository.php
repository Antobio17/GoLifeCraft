<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleRepository;
use Nutrition\Catalog\NutritionFacts\Domain\Model\NutritionFacts;
use Ramsey\Uuid\Uuid;

final class DoctrineArticleRepository extends EntityRepository implements ArticleRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Article
    {
        return $this->getEntityManager()->find(className: Article::class, id: $id);
    }

    public function findByBarcode(string $barcode): ?Article
    {
        return $this->findOneBy(['barcode' => $barcode]);
    }

    public function save(Article $article): void
    {
        $this->getEntityManager()->persist(object: $article);
    }

    public function delete(Article $article): void
    {
        $entityManager = $this->getEntityManager();
        $entityManager->remove(object: $article);

        if (null === $article->nutritionFactsId) {
            return;
        }

        $nutritionFacts = $this->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId);
        if (null !== $nutritionFacts) {
            $entityManager->remove(object: $nutritionFacts);
        }
    }

    public function findNutritionFactsById(string $nutritionFactsId): ?NutritionFacts
    {
        return $this->getEntityManager()->find(className: NutritionFacts::class, id: $nutritionFactsId);
    }

    public function saveNutritionFacts(NutritionFacts $nutritionFacts): void
    {
        $this->getEntityManager()->persist(object: $nutritionFacts);
    }
}
