<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\Model\Doctrine;

use Doctrine\ORM\EntityRepository;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\Model\TicketRepository;
use Ramsey\Uuid\Uuid;

final class DoctrineTicketRepository extends EntityRepository implements TicketRepository
{
    public function nextId(): string
    {
        return Uuid::uuid4()->toString();
    }

    public function findById(string $id): ?Ticket
    {
        $ticket = $this->find($id);

        if (null === $ticket) {
            return null;
        }

        $ticket->items = $this->itemsOf(ticketId: $id);

        return $ticket;
    }

    public function save(Ticket $ticket): void
    {
        $entityManager = $this->getEntityManager();

        $this->removeItemsOutside(
            ticketId: $ticket->id,
            keptItemIds: array_map(
                callback: static fn (TicketItem $item): string => $item->id,
                array: $ticket->items,
            ),
        );

        $entityManager->persist(object: $ticket);

        foreach ($ticket->items as $item) {
            $entityManager->persist(object: $item);
        }
    }

    public function delete(Ticket $ticket): void
    {
        $entityManager = $this->getEntityManager();

        foreach ($ticket->items as $item) {
            $entityManager->remove(object: $item);
        }

        $entityManager->remove(object: $ticket);
    }

    /**
     * @param array<int, string> $keptItemIds
     */
    private function removeItemsOutside(string $ticketId, array $keptItemIds): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder()
            ->delete(delete: TicketItem::class, alias: 'item')
            ->where('item.ticketId = :ticketId')
            ->setParameter(key: 'ticketId', value: $ticketId);

        if ([] !== $keptItemIds) {
            $queryBuilder->andWhere('item.id NOT IN (:keptItemIds)')
                ->setParameter(key: 'keptItemIds', value: $keptItemIds);
        }

        $queryBuilder->getQuery()->execute();
    }

    /**
     * @return TicketItem[]
     */
    private function itemsOf(string $ticketId): array
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('item')
            ->from(from: TicketItem::class, alias: 'item')
            ->where('item.ticketId = :ticketId')
            ->orderBy('item.position', 'ASC')
            ->setParameter(key: 'ticketId', value: $ticketId)
            ->getQuery()
            ->getResult();
    }
}
