<?php

namespace Nutrition\Catalog\Article\Domain\Service;

interface ArticleDraftQuotaGuard
{
    public function consume(string $userId): void;
}
