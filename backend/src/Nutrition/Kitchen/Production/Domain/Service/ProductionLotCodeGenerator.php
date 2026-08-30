<?php

namespace Nutrition\Kitchen\Production\Domain\Service;

interface ProductionLotCodeGenerator
{
    /**
     * Short code the cook writes on the tupper: every cooked batch gets the next one.
     */
    public function next(): string;
}
