<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Application\Command;

use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class TicketTestPaper
{
    public static function ticket(
        string $id,
        ?string $supermarketId,
        DateTimeGenerator $dateTimeGenerator,
    ): Ticket {
        $ticket = new Ticket();
        $ticket->id = $id;
        $ticket->storeName = 'MERCADONA S.A.';
        $ticket->supermarketId = $supermarketId;
        $ticket->purchasedOn = '2026-09-11';
        $ticket->total = 12.45;
        $ticket->stampCreation(userId: 'god-user-id', now: $dateTimeGenerator->now());

        return $ticket;
    }

    public static function milk(): TicketArticleCandidate
    {
        return new TicketArticleCandidate(
            articleId: 'article-milk',
            name: 'Leche desnatada',
            brand: 'Hacendado',
            emoji: '🥛',
            packUnit: 'brik',
            packSize: 1000.0,
            baseUnit: 'ml',
        );
    }

    public static function rice(): TicketArticleCandidate
    {
        return new TicketArticleCandidate(
            articleId: 'article-rice',
            name: 'Arroz redondo',
            brand: null,
            emoji: '🍚',
            packUnit: null,
            packSize: null,
            baseUnit: 'g',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public static function line(string $rawName, float $quantity, ?float $unitPrice = null): array
    {
        return [
            'rawName' => $rawName,
            'quantity' => $quantity,
            'unitPrice' => $unitPrice,
        ];
    }
}
