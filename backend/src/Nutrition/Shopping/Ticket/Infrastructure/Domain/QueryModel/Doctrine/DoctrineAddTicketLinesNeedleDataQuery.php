<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\QueryModel\AddTicketLinesNeedleDataQuery;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;

final readonly class DoctrineAddTicketLinesNeedleDataQuery implements AddTicketLinesNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findRememberedArticleId(string $normalizedName, ?string $supermarketId): ?string
    {
        $queryBuilder = $this->connection->createQueryBuilder()
            ->select('ti.article_id')
            ->from(table: 'shopping_ticket_item', alias: 'ti')
            ->innerJoin(fromAlias: 'ti', join: 'shopping_ticket', alias: 't', condition: 'ti.ticket_id = t.id')
            ->innerJoin(fromAlias: 'ti', join: 'article', alias: 'a', condition: 'ti.article_id = a.id')
            ->where('ti.normalized_name = :normalizedName')
            ->andWhere('ti.link_source IN (:linkSources)')
            ->orderBy('ti.updated_at', 'DESC')
            ->setMaxResults(maxResults: 1)
            ->setParameter(key: 'normalizedName', value: $normalizedName)
            ->setParameter(
                key: 'linkSources',
                value: [TicketItem::LINK_SOURCE_MANUAL, TicketItem::LINK_SOURCE_MEMORY],
                type: ArrayParameterType::STRING,
            );

        null === $supermarketId
            ? $queryBuilder->andWhere('t.supermarket_id IS NULL')
            : $queryBuilder
                ->andWhere('(t.supermarket_id = :supermarketId OR t.supermarket_id IS NULL)')
                ->setParameter(key: 'supermarketId', value: $supermarketId);

        $articleId = $queryBuilder->executeQuery()->fetchOne();

        return false === $articleId ? null : (string) $articleId;
    }

    public function findCandidates(): array
    {
        $rows = $this->connection->createQueryBuilder()
            ->select(
                'a.id',
                'a.name',
                'a.brand',
                'a.emoji',
                'a.base_unit',
                'a.pack_unit',
                'ae.quantity AS pack_size',
            )
            ->from(table: 'article', alias: 'a')
            ->leftJoin(fromAlias: 'a', join: 'article_equivalence', alias: 'ae', condition: 'ae.article_id = a.id AND ae.unit = a.pack_unit')
            ->executeQuery()
            ->fetchAllAssociative();

        return array_map(
            callback: static fn (array $row): TicketArticleCandidate => new TicketArticleCandidate(
                articleId: $row['id'],
                name: $row['name'],
                brand: $row['brand'],
                emoji: $row['emoji'],
                packUnit: $row['pack_unit'],
                packSize: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
                baseUnit: $row['base_unit'] ?? 'g',
            ),
            array: $rows,
        );
    }
}
