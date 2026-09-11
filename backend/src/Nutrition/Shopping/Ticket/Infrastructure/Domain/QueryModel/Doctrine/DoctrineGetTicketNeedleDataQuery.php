<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\GetTicketResult;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketItemView;
use Nutrition\Shopping\Ticket\Domain\QueryModel\GetTicketNeedleDataQuery;

final readonly class DoctrineGetTicketNeedleDataQuery implements GetTicketNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findTicket(string $ticketId): ?GetTicketResult
    {
        $row = $this->connection->createQueryBuilder()
            ->select(
                't.id',
                't.store_name',
                't.supermarket_id',
                't.purchased_on',
                't.total',
                't.note',
                't.status',
                't.created_at',
                't.updated_at',
                't.created_by_user_id',
                't.updated_by_user_id',
                's.name AS supermarket_name',
            )
            ->from(table: 'shopping_ticket', alias: 't')
            ->leftJoin(fromAlias: 't', join: 'supermarket', alias: 's', condition: 't.supermarket_id = s.id')
            ->where('t.id = :ticketId')
            ->setParameter(key: 'ticketId', value: $ticketId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        $items = $this->itemsOf(ticketId: $ticketId);

        return new GetTicketResult(
            id: $row['id'],
            aggregateName: 'Ticket',
            storeName: $row['store_name'],
            supermarketId: $row['supermarket_id'],
            supermarketName: $row['supermarket_name'],
            purchasedOn: $row['purchased_on'],
            total: null !== $row['total'] ? (float) $row['total'] : null,
            note: $row['note'] ?? '',
            status: $row['status'],
            totalItems: count($items),
            linkedItems: self::countLinked(items: $items),
            pendingItems: count($items) - self::countLinked(items: $items),
            receivedItems: self::countReceived(items: $items),
            linkedAmount: self::linkedAmount(items: $items),
            items: $items,
            createdAt: new \DateTime($row['created_at']),
            updatedAt: new \DateTime($row['updated_at']),
            createdByUserId: $row['created_by_user_id'],
            updatedByUserId: $row['updated_by_user_id'],
        );
    }

    /**
     * @return TicketItemView[]
     */
    private function itemsOf(string $ticketId): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'i.id',
                'i.position',
                'i.raw_name',
                'i.quantity',
                'i.raw_unit',
                'i.unit_price',
                'i.total_price',
                'i.article_id',
                'i.link_source',
                'i.pack_unit',
                'i.pack_size',
                'i.base_unit',
                'i.base_quantity',
                'i.article_name_snapshot',
                'i.article_emoji_snapshot',
                'i.received_at',
                'a.name AS article_name',
                'a.emoji AS article_emoji',
                'a.image AS article_image',
                'a.price AS article_price',
            )
            ->from(table: 'shopping_ticket_item', alias: 'i')
            ->leftJoin(fromAlias: 'i', join: 'article', alias: 'a', condition: 'i.article_id = a.id')
            ->where('i.ticket_id = :ticketId')
            ->orderBy('i.position', 'ASC')
            ->setParameter(key: 'ticketId', value: $ticketId)
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(
            callback: static fn (array $row): TicketItemView => new TicketItemView(
                id: $row['id'],
                position: (int) $row['position'],
                rawName: $row['raw_name'],
                quantity: (float) $row['quantity'],
                rawUnit: $row['raw_unit'],
                unitPrice: null !== $row['unit_price'] ? (float) $row['unit_price'] : null,
                totalPrice: null !== $row['total_price'] ? (float) $row['total_price'] : null,
                articleId: $row['article_id'],
                articleName: $row['article_name'] ?? $row['article_name_snapshot'],
                articleEmoji: $row['article_emoji'] ?? $row['article_emoji_snapshot'],
                articleImage: $row['article_image'],
                articlePrice: null !== $row['article_price'] ? (float) $row['article_price'] : null,
                linkSource: $row['link_source'],
                packUnit: $row['pack_unit'],
                packSize: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
                baseUnit: $row['base_unit'],
                baseQuantity: null !== $row['base_quantity'] ? (float) $row['base_quantity'] : null,
                received: null !== $row['received_at'],
            ),
            array: $rows,
        );
    }

    /**
     * @param TicketItemView[] $items
     */
    private static function countLinked(array $items): int
    {
        return count(array_filter(
            array: $items,
            callback: static fn (TicketItemView $item): bool => null !== $item->articleId,
        ));
    }

    /**
     * @param TicketItemView[] $items
     */
    private static function countReceived(array $items): int
    {
        return count(array_filter(
            array: $items,
            callback: static fn (TicketItemView $item): bool => $item->received,
        ));
    }

    /**
     * @param TicketItemView[] $items
     */
    private static function linkedAmount(array $items): float
    {
        $amount = 0.0;

        foreach ($items as $item) {
            $amount += null === $item->articleId ? 0.0 : (float) $item->totalPrice;
        }

        return round(num: $amount, precision: 2);
    }
}
