<?php

namespace Integration\Mcp\OAuth\Infrastructure\Domain\Service\Store;

use Psr\Cache\CacheItemPoolInterface;

final readonly class AuthorizationCodeStore
{
    private const string PREFIX = 'mcp_oauth_code_';

    public function __construct(
        private CacheItemPoolInterface $cache,
        private int $ttl = 300,
    ) {
    }

    public function generate(): string
    {
        return bin2hex(string: random_bytes(length: 32));
    }

    public function store(string $code, array $data): void
    {
        $item = $this->cache->getItem(key: self::PREFIX.$code);
        $item->set(value: $data);
        $item->expiresAfter(time: $this->ttl);
        $this->cache->save(item: $item);
    }

    public function pull(string $code): ?array
    {
        $item = $this->cache->getItem(key: self::PREFIX.$code);

        if (!$item->isHit()) {
            return null;
        }

        $this->cache->deleteItem(key: self::PREFIX.$code);

        return $item->get();
    }
}
