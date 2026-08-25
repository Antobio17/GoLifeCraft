<?php

namespace Integration\Gemini\Client\Domain\Model;

final readonly class GeminiResponse
{
    /**
     * @param array<string, mixed>|null $data
     * @param string[]                  $notes
     */
    private function __construct(
        public ?array $data,
        public array $notes,
    ) {
    }

    /**
     * @param array<string, mixed> $data
     * @param string[]             $notes
     */
    public static function success(array $data, array $notes): self
    {
        return new self(data: $data, notes: $notes);
    }

    /**
     * @param string[] $notes
     */
    public static function failure(array $notes): self
    {
        return new self(data: null, notes: $notes);
    }

    public function isSuccessful(): bool
    {
        return null !== $this->data;
    }
}
