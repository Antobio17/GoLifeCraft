<?php

namespace App\Tests\Integration\Mercadona\Domain\Model;

use Integration\Mercadona\Domain\Model\MercadonaProduct;
use PHPUnit\Framework\TestCase;

final class MercadonaProductTest extends TestCase
{
    public function testItExtractsEveryPriceFieldFromPriceInstructions(): void
    {
        $product = MercadonaProduct::fromApiData(data: $this->apiData());

        $this->assertSame(17.75, $product->price->unitPrice);
        $this->assertSame(3.55, $product->price->bulkPrice);
        $this->assertSame(3.55, $product->price->referencePrice);
        $this->assertSame('L', $product->price->referenceFormat);
        $this->assertSame(18.75, $product->price->previousUnitPrice);
    }

    public function testItKeepsPricesEmptyWhenPriceInstructionsAreMissing(): void
    {
        $data = $this->apiData();
        unset($data['price_instructions']);

        $product = MercadonaProduct::fromApiData(data: $data);

        $this->assertNull($product->price->unitPrice);
        $this->assertNull($product->price->bulkPrice);
        $this->assertNull($product->price->referencePrice);
        $this->assertNull($product->price->referenceFormat);
        $this->assertNull($product->price->previousUnitPrice);
    }

    public function testItStillExtractsQuantityAlongsidePrices(): void
    {
        $product = MercadonaProduct::fromApiData(data: $this->apiData());

        $this->assertSame('8402001027482', $product->barcode);
        $this->assertSame('Aceite de oliva 0,4º Hacendado', $product->name);
        $this->assertSame('5 L', $product->quantity);
    }

    private function apiData(): array
    {
        return [
            'ean' => '8402001027482',
            'display_name' => 'Aceite de oliva 0,4º Hacendado',
            'brand' => 'Hacendado',
            'photos' => [],
            'price_instructions' => [
                'unit_size' => 5.0,
                'bulk_price' => '3.55',
                'unit_price' => '17.75',
                'size_format' => 'l',
                'reference_price' => '3.550',
                'reference_format' => 'L',
                'previous_unit_price' => '       18.75',
            ],
        ];
    }
}
