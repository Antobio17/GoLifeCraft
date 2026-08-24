<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Service\ImpersonationRevoker;
use Psr\Cache\CacheItemPoolInterface;

final readonly class CacheImpersonationRevoker implements ImpersonationRevoker
{
    private const string PREFIX = 'impersonation_revoked_';

    public function __construct(
        private CacheItemPoolInterface $cache,
        private int $ttlSeconds,
    ) {
    }

    public function revoke(string $tokenId): void
    {
        $item = $this->cache->getItem(key: self::PREFIX.$tokenId);
        $item->set(value: true);
        $item->expiresAfter(time: $this->ttlSeconds);

        $this->cache->save(item: $item);
    }

    public function isRevoked(string $tokenId): bool
    {
        return $this->cache->getItem(key: self::PREFIX.$tokenId)->isHit();
    }
}
