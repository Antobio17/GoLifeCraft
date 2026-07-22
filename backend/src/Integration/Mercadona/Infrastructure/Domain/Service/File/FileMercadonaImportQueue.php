<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\File;

use Integration\Mercadona\Domain\Service\MercadonaImportQueue;

final class FileMercadonaImportQueue implements MercadonaImportQueue
{
    /**
     * @var array{initialized: bool, subcategoriesPending: int[], productsPending: int[], seenProducts: array<int, bool>}|null
     */
    private ?array $state = null;

    public function __construct(
        private readonly string $filePath,
    ) {
    }

    public function isInitialized(): bool
    {
        return $this->load()['initialized'];
    }

    public function initialize(array $subcategoryIds): void
    {
        $this->state = [
            'initialized' => true,
            'subcategoriesPending' => array_values(array_unique(array_map(static fn (int $id): int => $id, $subcategoryIds))),
            'productsPending' => [],
            'seenProducts' => [],
        ];

        $this->persist();
    }

    public function reset(): void
    {
        $this->state = $this->emptyState();
        $this->persist();
    }

    public function peekSubcategory(): ?int
    {
        return $this->load()['subcategoriesPending'][0] ?? null;
    }

    public function markSubcategoryScanned(int $subcategoryId): void
    {
        $state = $this->load();
        $state['subcategoriesPending'] = array_values(array_filter(
            $state['subcategoriesPending'],
            static fn (int $id): bool => $id !== $subcategoryId,
        ));

        $this->state = $state;
        $this->persist();
    }

    public function enqueueProducts(array $productIds): void
    {
        $state = $this->load();

        foreach ($productIds as $productId) {
            if (isset($state['seenProducts'][$productId])) {
                continue;
            }

            $state['seenProducts'][$productId] = true;
            $state['productsPending'][] = $productId;
        }

        $this->state = $state;
        $this->persist();
    }

    public function peekProduct(): ?int
    {
        return $this->load()['productsPending'][0] ?? null;
    }

    public function markProductProcessed(int $productId): void
    {
        $state = $this->load();
        $state['productsPending'] = array_values(array_filter(
            $state['productsPending'],
            static fn (int $id): bool => $id !== $productId,
        ));

        $this->state = $state;
        $this->persist();
    }

    public function pendingSubcategories(): int
    {
        return count($this->load()['subcategoriesPending']);
    }

    public function pendingProducts(): int
    {
        return count($this->load()['productsPending']);
    }

    /**
     * @return array{initialized: bool, subcategoriesPending: int[], productsPending: int[], seenProducts: array<int, bool>}
     */
    private function load(): array
    {
        if (null !== $this->state) {
            return $this->state;
        }

        if (!is_file($this->filePath)) {
            return $this->state = $this->emptyState();
        }

        $decoded = json_decode((string) file_get_contents($this->filePath), true);

        return $this->state = is_array($decoded) ? $this->normalize(data: $decoded) : $this->emptyState();
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return array{initialized: bool, subcategoriesPending: int[], productsPending: int[], seenProducts: array<int, bool>}
     */
    private function normalize(array $data): array
    {
        return [
            'initialized' => (bool) ($data['initialized'] ?? false),
            'subcategoriesPending' => array_map(static fn ($id): int => (int) $id, is_array($data['subcategoriesPending'] ?? null) ? $data['subcategoriesPending'] : []),
            'productsPending' => array_map(static fn ($id): int => (int) $id, is_array($data['productsPending'] ?? null) ? $data['productsPending'] : []),
            'seenProducts' => $this->normalizeSeen(seen: $data['seenProducts'] ?? null),
        ];
    }

    /**
     * @return array<int, bool>
     */
    private function normalizeSeen(mixed $seen): array
    {
        if (!is_array($seen)) {
            return [];
        }

        $normalized = [];
        foreach ($seen as $key => $value) {
            $normalized[(int) $key] = true;
        }

        return $normalized;
    }

    /**
     * @return array{initialized: bool, subcategoriesPending: int[], productsPending: int[], seenProducts: array<int, bool>}
     */
    private function emptyState(): array
    {
        return [
            'initialized' => false,
            'subcategoriesPending' => [],
            'productsPending' => [],
            'seenProducts' => [],
        ];
    }

    private function persist(): void
    {
        $directory = dirname($this->filePath);
        if (!is_dir($directory) && !@mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new \RuntimeException(sprintf('Unable to create queue directory "%s".', $directory));
        }

        $written = @file_put_contents($this->filePath, json_encode($this->state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
        if (false === $written) {
            throw new \RuntimeException(sprintf('Unable to write queue state to "%s". Check that the directory is writable by the worker user (www-data, uid 33).', $this->filePath));
        }
    }
}
