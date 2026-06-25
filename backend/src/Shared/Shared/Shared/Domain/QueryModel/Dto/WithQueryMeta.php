<?php

declare(strict_types=1);

namespace Shared\Shared\Shared\Domain\QueryModel\Dto;

interface WithQueryMeta
{
    public function getQueryMeta(): array;
}
