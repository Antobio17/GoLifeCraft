<?php

namespace Nutrition\Kitchen\Production\Domain\Service;

interface ProductionLotCodeGenerator
{
    public function next(): string;
}
