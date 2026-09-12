<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\QueryModel\Doctrine;

use Doctrine\DBAL\Connection;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftGrounding;
use Nutrition\Shopping\Ticket\Domain\QueryModel\TicketDraftGroundingNeedleDataQuery;

final readonly class DoctrineTicketDraftGroundingNeedleDataQuery implements TicketDraftGroundingNeedleDataQuery
{
    public function __construct(private Connection $connection)
    {
    }

    public function load(): TicketDraftGrounding
    {
        $rows = $this->connection->createQueryBuilder()
            ->select('t.id', 't.name')
            ->from(table: 'supermarket', alias: 't')
            ->orderBy(sort: 't.name', order: 'ASC')
            ->executeQuery()
            ->fetchAllAssociative();

        $supermarkets = [];
        foreach ($rows as $row) {
            $supermarkets[$row['id']] = $row['name'];
        }

        return new TicketDraftGrounding(supermarkets: $supermarkets);
    }
}
