<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\Service\Gemini;

use Integration\Gemini\Client\Domain\Model\GeminiImage;
use Integration\Gemini\Client\Domain\Service\GeminiClient;
use Nutrition\Catalog\Article\Domain\Exception\GetArticleDraftException;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticlePackaging;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraft;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftEquivalence;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftExtraction;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftGrounding;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftNutrition;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftPhoto;
use Nutrition\Catalog\Article\Domain\Service\ArticleDraftExtractor;

final readonly class GeminiArticleDraftExtractor implements ArticleDraftExtractor
{
    private const int MAX_ATTEMPTS = 1;
    private const float REFERENCE_AMOUNT = 100.0;
    private const string FALLBACK_EMOJI = '🍽️';
    private const array LOW_CONFIDENCE_FIELDS = [
        'name', 'brand', 'emoji', 'price', 'quantity',
        'categoryId', 'supermarketId', 'aisleId', 'nutrition',
    ];
    private const string PROMPT = <<<'PROMPT'
        Eres un asistente de alta de productos de supermercado. En todas las imágenes aparece el MISMO producto: el envase, la etiqueta nutricional y/o la etiqueta de precio del lineal.

        Devuelve un único producto con los campos del esquema.

        Reglas:
        - Si un dato no aparece en las imágenes, ponlo a null. No inventes ni estimes NUNCA.
        - found = true solo si reconoces el producto en las imágenes.
        - name: el nombre comercial del producto, sin la marca y sin el formato. Entre 2 y 255 caracteres.
        - quantity: el contenido del envase tal y como está impreso ("500 g", "1 L", "4 x 125 g", "6 uds"). Null si no se lee.
        - baseUnit: "g" para sólidos, "ml" para líquidos.
        - price: solo si aparece un precio en euros en una etiqueta de lineal o en un ticket. El precio NO suele venir impreso en el envase: en ese caso, null.
        - emoji: un único emoji, el más específico que represente al producto. Si nada encaja, 🍽️.
        - nutritionFound = true solo si localizas la tabla de información nutricional y es legible POR 100 g o POR 100 ml. Si no hay tabla, es ilegible o solo aparece por ración, nutritionFound = false y todos los macros a null.
        - Los macros van siempre por 100 g/ml, en gramos, con punto decimal; calories en kcal por 100 g/ml.
        - lowConfidence: lista con los nombres de los campos que has rellenado sin verlos con total claridad.
        %s
        PROMPT;

    public function __construct(
        private GeminiClient $geminiClient,
    ) {
    }

    public function extract(array $photos, ArticleDraftGrounding $grounding): ArticleDraftExtraction
    {
        if (!$this->geminiClient->isConfigured()) {
            throw GetArticleDraftException::extractorIsNotAvailable();
        }

        $notes = [];
        $images = $this->images(photos: $photos, notes: $notes);

        if ([] === $images) {
            return ArticleDraftExtraction::failure(notes: ['None of the photos could be read.']);
        }

        $response = $this->geminiClient->generateJson(
            prompt: sprintf(self::PROMPT, $this->groundingBlock(grounding: $grounding)),
            images: $images,
            schema: $this->schema(grounding: $grounding),
            maxAttempts: self::MAX_ATTEMPTS,
        );

        $notes = array_merge($notes, $response->notes);

        if (!$response->isSuccessful() || true !== ($response->data['found'] ?? null)) {
            return ArticleDraftExtraction::failure(notes: $notes);
        }

        return ArticleDraftExtraction::success(
            draft: $this->toDraft(data: $response->data, grounding: $grounding, notes: $notes),
            lowConfidenceFields: $this->lowConfidenceFields(data: $response->data),
            notes: $notes,
        );
    }

    /**
     * @param ArticleDraftPhoto[] $photos
     * @param string[]            $notes
     *
     * @return GeminiImage[]
     */
    private function images(array $photos, array &$notes): array
    {
        $images = [];
        foreach ($photos as $photo) {
            $bytes = @file_get_contents(filename: $photo->path);

            if (false === $bytes || '' === $bytes) {
                $notes[] = sprintf('A photo could not be read from disk (%s).', $photo->mimeType);
                continue;
            }

            $image = new GeminiImage(mimeType: $photo->mimeType, bytes: $bytes);
            $notes[] = sprintf('Photo sent to Gemini: %s, %d KB.', $photo->mimeType, $image->sizeInKilobytes());
            $images[] = $image;
        }

        return $images;
    }

    private function groundingBlock(ArticleDraftGrounding $grounding): string
    {
        $blocks = [];

        if ([] !== $grounding->categories) {
            $blocks[] = "Categorías existentes (elige el id exacto de una, o null si ninguna encaja):\n".$this->list(items: $grounding->categories);
        }

        if ([] !== $grounding->supermarkets) {
            $blocks[] = "Supermercados existentes (elige el id exacto de uno, o null):\n".$this->list(items: $grounding->supermarkets);
        }

        foreach ($grounding->aisles as $supermarketId => $aislesOfSupermarket) {
            $supermarketName = $grounding->supermarkets[$supermarketId] ?? $supermarketId;
            $blocks[] = sprintf("Pasillos de %s (solo válidos si eliges ese supermercado):\n", $supermarketName).$this->list(items: $aislesOfSupermarket);
        }

        if ([] === $blocks) {
            return '';
        }

        return "\n".implode("\n\n", $blocks);
    }

    /**
     * @param array<string, string> $items
     */
    private function list(array $items): string
    {
        $lines = [];
        foreach ($items as $id => $name) {
            $lines[] = sprintf('- %s: %s', $id, $name);
        }

        return implode("\n", $lines);
    }

    /**
     * @param array<string, mixed> $data
     * @param string[]             $notes
     */
    private function toDraft(array $data, ArticleDraftGrounding $grounding, array &$notes): ArticleDraft
    {
        $quantity = $this->toTrimmedString(value: $data['quantity'] ?? null);
        $packaging = ArticlePackaging::fromQuantity(quantity: $quantity);
        $baseUnit = $this->resolveBaseUnit(packaging: $packaging, quantity: $quantity, data: $data);

        $supermarketId = $this->pick(value: $data['supermarketId'] ?? null, allowed: $grounding->supermarketIds());
        $aisleId = $this->pick(value: $data['aisleId'] ?? null, allowed: $grounding->aisleIds());

        if (null !== $aisleId && !$grounding->belongsToSupermarket(supermarketId: $supermarketId, aisleId: $aisleId)) {
            $notes[] = 'The suggested aisle does not belong to the suggested supermarket: dropped.';
            $aisleId = null;
        }

        return new ArticleDraft(
            name: $this->toTrimmedString(value: $data['name'] ?? null),
            brand: $this->toTrimmedString(value: $data['brand'] ?? null),
            emoji: $this->toTrimmedString(value: $data['emoji'] ?? null) ?? self::FALLBACK_EMOJI,
            price: $this->toPositiveFloat(value: $data['price'] ?? null),
            categoryId: $this->pick(value: $data['categoryId'] ?? null, allowed: $grounding->categoryIds()),
            supermarketId: $supermarketId,
            aisleId: $aisleId,
            quantity: $quantity,
            baseUnit: $baseUnit,
            recipeUnit: $baseUnit,
            diaryUnit: null !== $packaging->unitSize() ? ArticleUnit::UNIT->value : $baseUnit,
            packUnit: $packaging->packUnit(),
            equivalences: ArticleDraftEquivalence::fromPackaging(packaging: $packaging),
            nutrition: $this->toNutrition(data: $data, notes: $notes),
        );
    }

    /**
     * @param array<string, mixed> $data
     */
    private function resolveBaseUnit(ArticlePackaging $packaging, ?string $quantity, array $data): string
    {
        if (null !== $quantity && null !== $packaging->packSize) {
            return $packaging->baseUnit;
        }

        $baseUnit = $this->toTrimmedString(value: $data['baseUnit'] ?? null);

        if (null !== $baseUnit && in_array($baseUnit, Article::BASE_UNITS, true)) {
            return $baseUnit;
        }

        return $packaging->baseUnit;
    }

    /**
     * @param array<string, mixed> $data
     * @param string[]             $notes
     */
    private function toNutrition(array $data, array &$notes): ?ArticleDraftNutrition
    {
        if (true !== ($data['nutritionFound'] ?? null)) {
            return null;
        }

        $nutrition = new ArticleDraftNutrition(
            referenceAmount: self::REFERENCE_AMOUNT,
            calories: $this->toPositiveFloat(value: $data['calories'] ?? null),
            protein: $this->toPositiveFloat(value: $data['protein'] ?? null),
            carbs: $this->toPositiveFloat(value: $data['carbs'] ?? null),
            sugars: $this->toPositiveFloat(value: $data['sugars'] ?? null),
            fat: $this->toPositiveFloat(value: $data['fat'] ?? null),
            saturatedFat: $this->toPositiveFloat(value: $data['saturatedFat'] ?? null),
            fiber: $this->toPositiveFloat(value: $data['fiber'] ?? null),
            salt: $this->toPositiveFloat(value: $data['salt'] ?? null),
        );

        if ($nutrition->isEmpty()) {
            return null;
        }

        if (!$nutrition->isCoherent()) {
            $notes[] = 'The nutrition table read from the label is not coherent: dropped.';

            return null;
        }

        return $nutrition;
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return string[]
     */
    private function lowConfidenceFields(array $data): array
    {
        $fields = $data['lowConfidence'] ?? [];

        if (!is_array($fields)) {
            return [];
        }

        return array_values(array_intersect(self::LOW_CONFIDENCE_FIELDS, $fields));
    }

    /**
     * @param string[] $allowed
     */
    private function pick(mixed $value, array $allowed): ?string
    {
        $candidate = $this->toTrimmedString(value: $value);

        if (null === $candidate || !in_array($candidate, $allowed, true)) {
            return null;
        }

        return $candidate;
    }

    private function toTrimmedString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : $trimmed;
    }

    private function toPositiveFloat(mixed $value): ?float
    {
        if (!is_numeric($value) || (float) $value < 0.0) {
            return null;
        }

        return (float) $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function schema(ArticleDraftGrounding $grounding): array
    {
        $nullableNumber = ['type' => 'NUMBER', 'nullable' => true];
        $nullableString = ['type' => 'STRING', 'nullable' => true];

        return [
            'type' => 'OBJECT',
            'properties' => [
                'found' => ['type' => 'BOOLEAN'],
                'name' => $nullableString,
                'brand' => $nullableString,
                'emoji' => $nullableString,
                'quantity' => $nullableString,
                'baseUnit' => ['type' => 'STRING', 'nullable' => true, 'enum' => Article::BASE_UNITS],
                'price' => $nullableNumber,
                'categoryId' => $this->enumerated(nullableString: $nullableString, allowed: $grounding->categoryIds()),
                'supermarketId' => $this->enumerated(nullableString: $nullableString, allowed: $grounding->supermarketIds()),
                'aisleId' => $this->enumerated(nullableString: $nullableString, allowed: $grounding->aisleIds()),
                'nutritionFound' => ['type' => 'BOOLEAN'],
                'calories' => $nullableNumber,
                'protein' => $nullableNumber,
                'carbs' => $nullableNumber,
                'sugars' => $nullableNumber,
                'fat' => $nullableNumber,
                'saturatedFat' => $nullableNumber,
                'fiber' => $nullableNumber,
                'salt' => $nullableNumber,
                'lowConfidence' => [
                    'type' => 'ARRAY',
                    'items' => ['type' => 'STRING', 'enum' => self::LOW_CONFIDENCE_FIELDS],
                ],
            ],
            'required' => ['found', 'nutritionFound'],
        ];
    }

    /**
     * @param array<string, mixed> $nullableString
     * @param string[]             $allowed
     *
     * @return array<string, mixed>
     */
    private function enumerated(array $nullableString, array $allowed): array
    {
        if ([] === $allowed) {
            return $nullableString;
        }

        return array_merge($nullableString, ['enum' => $allowed]);
    }
}
