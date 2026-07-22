<?php

namespace Integration\Mercadona\Domain\Model;

final readonly class NutritionExtraction
{
    public const string STATUS_SUCCESS = 'success';
    public const string STATUS_MISSING_API_KEY = 'missing api key';
    public const string STATUS_NO_IMAGES = 'no label images';
    public const string STATUS_IMAGES_UNAVAILABLE = 'label images could not be downloaded';
    public const string STATUS_NO_RESPONSE = 'no usable response from Gemini';
    public const string STATUS_NOT_FOUND = 'nutrition table not found in the images';
    public const string STATUS_INCOHERENT = 'extracted values rejected by the coherence check';

    /**
     * @param string[] $notes
     */
    private function __construct(
        public ?MercadonaNutrition $nutrition,
        public string $status,
        public array $notes,
    ) {
    }

    /**
     * @param string[] $notes
     */
    public static function success(MercadonaNutrition $nutrition, array $notes = []): self
    {
        return new self(nutrition: $nutrition, status: self::STATUS_SUCCESS, notes: $notes);
    }

    /**
     * @param string[] $notes
     */
    public static function failure(string $status, array $notes = []): self
    {
        return new self(nutrition: null, status: $status, notes: $notes);
    }

    public function isSuccessful(): bool
    {
        return null !== $this->nutrition;
    }
}
