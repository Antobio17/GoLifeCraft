<?php

namespace Nutrition\Kitchen\Production\Infrastructure\Domain\Service\InMemory;

use Nutrition\Kitchen\Production\Domain\Service\ProductionLotCodeGenerator;

final class InMemoryProductionLotCodeGenerator implements ProductionLotCodeGenerator
{
    private int $counter = 0;

    public function next(): string
    {
        ++$this->counter;

        return 'L-'.str_pad(string: (string) $this->counter, length: 3, pad_string: '0', pad_type: \STR_PAD_LEFT);
    }
}
