<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;
use Nutrition\Shopping\Ticket\Domain\QueryModel\LinkTicketItemNeedleDataQuery;

final readonly class DoctrineLinkTicketItemNeedleDataQuery implements LinkTicketItemNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function findArticle(string $articleId): ?TicketArticleCandidate
    {
        $row = $this->connection->createQueryBuilder()
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
            ->where('a.id = :articleId')
            ->setParameter(key: 'articleId', value: $articleId)
            ->executeQuery()
            ->fetchAssociative();

        if (false === $row) {
            return null;
        }

        return new TicketArticleCandidate(
            articleId: $row['id'],
            name: $row['name'],
            brand: $row['brand'],
            emoji: $row['emoji'],
            packUnit: $row['pack_unit'],
            packSize: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
            baseUnit: $row['base_unit'] ?? 'g',
        );
    }
}
