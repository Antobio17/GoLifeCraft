<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\Service\Cache;

use Nutrition\Catalog\Article\Domain\Exception\ArticleDraftQuotaException;
use Nutrition\Catalog\Article\Domain\Service\ArticleDraftQuotaGuard;
use Psr\Cache\CacheItemPoolInterface;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CacheArticleDraftQuotaGuard implements ArticleDraftQuotaGuard
{
    private const int TTL_IN_SECONDS = 86400;

    public function __construct(
        private CacheItemPoolInterface $cache,
        private DateTimeGenerator $dateTimeGenerator,
        private int $dailyLimit,
    ) {
    }

    public function consume(string $userId): void
    {
        $key = sprintf(
            'article_draft_quota.%s.%s',
            $this->dateTimeGenerator->now()->format(format: 'Ymd'),
            sha1($userId)
        );

        $item = $this->cache->getItem(key: $key);
        $used = (int) ($item->get() ?? 0);

        if ($used >= $this->dailyLimit) {
            throw ArticleDraftQuotaException::dailyLimitReached(limit: $this->dailyLimit);
        }

        $item->set(value: $used + 1);
        $item->expiresAfter(time: self::TTL_IN_SECONDS);
        $this->cache->save(item: $item);
    }
}
