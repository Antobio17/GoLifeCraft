<?php

namespace App\Tests\Nutrition\Catalog\Article\Domain\Model;

use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticlePackaging;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;
use PHPUnit\Framework\TestCase;

final class ArticlePackagingTest extends TestCase
{
    public function testItReadsAMassQuantity(): void
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: '0.5 KG');

        $this->assertSame(Article::BASE_UNIT_GRAM, $packaging->baseUnit);
        $this->assertSame(500.0, $packaging->packSize);
        $this->assertNull($packaging->unitsPerPack);
        $this->assertSame(ArticleUnit::PACK->value, $packaging->packUnit());
        $this->assertSame(Article::BASE_UNIT_GRAM, $packaging->diaryUnit());
    }

    public function testItReadsAVolumeQuantityAsMilliliters(): void
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: '1 Litro');

        $this->assertSame(Article::BASE_UNIT_MILLILITER, $packaging->baseUnit);
        $this->assertSame(1000.0, $packaging->packSize);
    }

    public function testItReadsQuantitiesWrittenWithoutSpaceOrWithComma(): void
    {
        $this->assertSame(200.0, ArticlePackaging::fromQuantity(quantity: '200g')->packSize);
        $this->assertSame(330.0, ArticlePackaging::fromQuantity(quantity: '330ml')->packSize);
        $this->assertSame(1500.0, ArticlePackaging::fromQuantity(quantity: '1,5 L')->packSize);
    }

    public function testItSplitsAMultipackIntoUnits(): void
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: '4 x 125 g');

        $this->assertSame(500.0, $packaging->packSize);
        $this->assertSame(4, $packaging->unitsPerPack);
        $this->assertSame(125.0, $packaging->unitSize());
        $this->assertSame(ArticleUnit::UNIT->value, $packaging->diaryUnit());
    }

    public function testItPrefersTheMultipackDetailOverTheTotal(): void
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: '1,98 L (6 x 33 cl)');

        $this->assertSame(Article::BASE_UNIT_MILLILITER, $packaging->baseUnit);
        $this->assertSame(1980.0, $packaging->packSize);
        $this->assertSame(6, $packaging->unitsPerPack);
        $this->assertSame(330.0, $packaging->unitSize());
    }

    public function testItIgnoresQuantitiesWithoutAKnownMeasurementUnit(): void
    {
        foreach ([null, '', '6 ud', '12 huevos'] as $quantity) {
            $packaging = ArticlePackaging::fromQuantity(quantity: $quantity);

            $this->assertSame(Article::BASE_UNIT_GRAM, $packaging->baseUnit);
            $this->assertNull($packaging->packSize);
            $this->assertNull($packaging->packUnit());
            $this->assertSame(Article::BASE_UNIT_GRAM, $packaging->diaryUnit());
        }
    }

    public function testItSkipsTheLeadingNoiseOfAFreeTextQuantity(): void
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: '0% MG 500 g');

        $this->assertSame(500.0, $packaging->packSize);
    }

    public function testItKeepsASinglePackAsAWholeWithoutUnits(): void
    {
        $packaging = ArticlePackaging::fromQuantity(quantity: '1 x 750 ml');

        $this->assertSame(750.0, $packaging->packSize);
        $this->assertSame(1, $packaging->unitsPerPack);
        $this->assertNull($packaging->unitSize());
        $this->assertSame(Article::BASE_UNIT_MILLILITER, $packaging->diaryUnit());
    }
}
