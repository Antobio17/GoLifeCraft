<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\Service\Cache;

use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftExtraction;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftPhoto;
use Nutrition\Shopping\Ticket\Domain\Service\TicketDraftStore;
use Psr\Cache\CacheItemPoolInterface;

final readonly class CacheTicketDraftStore implements TicketDraftStore
{
    private const int TTL_IN_SECONDS = 1800;

    public function __construct(
        private CacheItemPoolInterface $cache,
    ) {
    }

    public function find(string $userId, array $photos): ?TicketDraftExtraction
    {
        $fingerprint = $this->fingerprint(userId: $userId, photos: $photos);

        if (null === $fingerprint) {
            return null;
        }

        $remembered = $this->cache->getItem(key: $fingerprint)->get();

        return $remembered instanceof TicketDraftExtraction ? $remembered : null;
    }

    public function keep(string $userId, array $photos, TicketDraftExtraction $extraction): void
    {
        $fingerprint = $this->fingerprint(userId: $userId, photos: $photos);

        if (null === $fingerprint) {
            return;
        }

        $item = $this->cache->getItem(key: $fingerprint);
        $item->set(value: $extraction);
        $item->expiresAfter(time: self::TTL_IN_SECONDS);
        $this->cache->save(item: $item);
    }

    /**
     * @param TicketDraftPhoto[] $photos
     */
    private function fingerprint(string $userId, array $photos): ?string
    {
        $hashes = [];

        foreach ($photos as $photo) {
            $hash = @sha1_file(filename: $photo->path);

            if (false === $hash) {
                return null;
            }

            $hashes[] = $hash;
        }

        if ([] === $hashes) {
            return null;
        }

        return sprintf('ticket_draft.%s.%s', sha1($userId), sha1(implode('|', $hashes)));
    }
}
