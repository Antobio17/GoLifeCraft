<?php

namespace App\Tests\Nutrition\Shopping\Ticket\Domain\Service;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;
use Nutrition\Shopping\Ticket\Domain\Service\TicketLineMatcher;
use PHPUnit\Framework\TestCase;

final class TicketLineMatcherTest extends TestCase
{
    private TicketLineMatcher $matcher;

    protected function setUp(): void
    {
        $this->matcher = new TicketLineMatcher();
    }

    public function testItSeesThroughTheAbbreviationsATillPrints(): void
    {
        $match = $this->matcher->bestMatch(
            rawName: 'LECHE DESNAT. BRIK 1L',
            candidates: [self::candidate(id: 'article-milk', name: 'Leche desnatada'), self::candidate(id: 'article-rice', name: 'Arroz redondo')],
        );

        $this->assertSame(expected: 'article-milk', actual: $match->articleId);
    }

    public function testItIgnoresAccentsAndPunctuation(): void
    {
        $match = $this->matcher->bestMatch(
            rawName: 'PLATANO CANARIAS',
            candidates: [self::candidate(id: 'article-banana', name: 'Plátano de Canarias')],
        );

        $this->assertSame(expected: 'article-banana', actual: $match->articleId);
    }

    public function testItKeepsQuietWhenNothingLooksLikeIt(): void
    {
        $match = $this->matcher->bestMatch(
            rawName: 'BOLSA PLASTICO',
            candidates: [self::candidate(id: 'article-milk', name: 'Leche desnatada')],
        );

        $this->assertNull(actual: $match);
    }

    public function testItKeepsQuietWhenTwoArticlesFitTheSame(): void
    {
        $match = $this->matcher->bestMatch(
            rawName: 'YOGUR NATURAL',
            candidates: [
                self::candidate(id: 'article-yogurt-one', name: 'Yogur natural'),
                self::candidate(id: 'article-yogurt-two', name: 'Yogur natural'),
            ],
        );

        $this->assertNull(actual: $match);
    }

    public function testItDoesNotMatchOnTheSizeAlone(): void
    {
        $match = $this->matcher->bestMatch(
            rawName: 'ACEITE OLIVA 1L',
            candidates: [self::candidate(id: 'article-milk', name: 'Leche desnatada 1L')],
        );

        $this->assertNull(actual: $match);
    }

    private static function candidate(string $id, string $name): TicketArticleCandidate
    {
        return new TicketArticleCandidate(
            articleId: $id,
            name: $name,
            brand: null,
            emoji: null,
            packUnit: null,
            packSize: null,
            baseUnit: 'g',
        );
    }
}
