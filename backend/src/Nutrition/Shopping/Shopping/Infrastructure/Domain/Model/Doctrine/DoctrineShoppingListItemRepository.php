<?php

namespace Nutrition\Shopping\Shopping\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItem;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItemRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineShoppingListItemRepository extends EntityRepository implements ShoppingListItemRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?ShoppingListItem
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('shoppingListItem')
            ->from(from: ShoppingListItem::class, alias: 'shoppingListItem')
            ->where('shoppingListItem.id = :id')
            ->setParameter(key: 'id', value: $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function save(ShoppingListItem $shoppingListItem): void
    {
        $this->getEntityManager()->persist(object: $shoppingListItem);
    }

    public function delete(ShoppingListItem $shoppingListItem): void
    {
        $this->getEntityManager()->remove(object: $shoppingListItem);
    }
}
