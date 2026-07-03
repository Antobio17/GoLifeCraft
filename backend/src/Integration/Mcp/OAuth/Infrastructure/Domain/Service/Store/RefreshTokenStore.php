<?php

namespace Integration\Mcp\OAuth\Infrastructure\Domain\Service\Store;

use Psr\Cache\CacheItemPoolInterface;

final readonly class RefreshTokenStore
{
    private const string PREFIX = 'mcp_oauth_refresh_';

    public function __construct(
        private CacheItemPoolInterface $cache,
        private int $ttl = 2592000,
    ) {
    }

    public function generate(): string
    {
        return bin2hex(string: random_bytes(length: 32));
    }

    public function store(string $token, array $data): void
    {
        $item = $this->cache->getItem(key: self::PREFIX.$token);
        $item->set(value: $data);
        $item->expiresAfter(time: $this->ttl);
        $this->cache->save(item: $item);
    }

    public function pull(string $token): ?array
    {
        $item = $this->cache->getItem(key: self::PREFIX.$token);

        if (!$item->isHit()) {
            return null;
        }

        $this->cache->deleteItem(key: self::PREFIX.$token);

        return $item->get();
    }
}
