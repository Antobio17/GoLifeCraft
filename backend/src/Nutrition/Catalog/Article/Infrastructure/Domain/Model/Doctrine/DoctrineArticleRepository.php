<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleEquivalence;
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
        return $this->withEquivalences(
            article: $this->getEntityManager()->find(className: Article::class, id: $id),
        );
    }

    public function findByBarcode(string $barcode): ?Article
    {
        return $this->withEquivalences(article: $this->findOneBy(['barcode' => $barcode]));
    }

    /**
     * Reconciles the equivalences by id: a command that does not rebuild them keeps the ones it loaded,
     * so wiping them all would drop the equivalences of every caller that only touches the article itself.
     */
    public function save(Article $article): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeEquivalences(
            articleId: $article->id,
            keptEquivalenceIds: array_map(
                callback: static fn (ArticleEquivalence $equivalence): string => $equivalence->id,
                array: $article->equivalences,
            ),
        );
        $entityManager->persist(object: $article);

        foreach ($article->equivalences as $equivalence) {
            $entityManager->persist(object: $equivalence);
        }
    }

    public function delete(Article $article): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeEquivalences(articleId: $article->id, keptEquivalenceIds: []);
        $entityManager->remove(object: $article);

        if (null === $article->nutritionFactsId) {
            return;
        }

        $nutritionFacts = $this->findNutritionFactsById(nutritionFactsId: $article->nutritionFactsId);
        if (null !== $nutritionFacts) {
            $entityManager->remove(object: $nutritionFacts);
        }
    }

    private function withEquivalences(?Article $article): ?Article
    {
        if (null === $article) {
            return null;
        }

        $article->equivalences = $this->getEntityManager()->getRepository(className: ArticleEquivalence::class)
            ->findBy(criteria: ['articleId' => $article->id], orderBy: ['position' => 'ASC']);

        return $article;
    }

    /**
     * @param array<int, string> $keptEquivalenceIds
     */
    private function removeEquivalences(string $articleId, array $keptEquivalenceIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: ArticleEquivalence::class, alias: 'equivalence')
            ->where('equivalence.articleId = :articleId')
            ->setParameter(key: 'articleId', value: $articleId);

        if ([] !== $keptEquivalenceIds) {
            $queryBuilder->andWhere('equivalence.id NOT IN (:keptEquivalenceIds)')
                ->setParameter(key: 'keptEquivalenceIds', value: $keptEquivalenceIds);
        }

        $queryBuilder->getQuery()->execute();
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
