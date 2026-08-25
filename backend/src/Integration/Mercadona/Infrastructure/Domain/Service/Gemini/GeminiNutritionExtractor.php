<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Gemini;

use Integration\Gemini\Client\Domain\Model\GeminiImage;
use Integration\Gemini\Client\Domain\Service\GeminiClient;
use Integration\Mercadona\Domain\Model\MercadonaNutrition;
use Integration\Mercadona\Domain\Model\NutritionExtraction;
use Integration\Mercadona\Domain\Service\MercadonaNutritionExtractor;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class GeminiNutritionExtractor implements MercadonaNutritionExtractor
{
    private const float REFERENCE_AMOUNT = 100.0;
    private const float ETHANOL_DENSITY = 0.789;
    private const int MAX_ATTEMPTS = 2;
    private const string IMAGE_MIME_TYPE = 'image/jpeg';
    private const string PROMPT = <<<'PROMPT'
        Eres un extractor de información nutricional. En las imágenes aparece la etiqueta de un producto de alimentación de supermercado.
        Localiza la tabla de "Información nutricional" y devuelve los valores POR 100 g o POR 100 ml (nunca por ración).
        Devuelve únicamente los campos: found, calories (kcal), protein, carbs, sugars, fat, saturatedFat, fiber, salt (todos en gramos por 100, salvo calories en kcal, con punto decimal) y alcoholVolume.
        Reglas:
        - found = true solo si localizas la tabla y es legible por 100 g/ml. Si no hay tabla, es ilegible, o solo aparece por ración, found = false.
        - Si un campo concreto no aparece en la etiqueta, ponlo a null. No inventes ni estimes ningún valor.
        - alcoholVolume es el grado alcohólico en % vol que aparece en la etiqueta (por ejemplo "12,5% vol" → 12.5). Si el producto no lleva alcohol o no aparece el grado, ponlo a null.
        PROMPT;

    public function __construct(
        private HttpClientInterface $httpClient,
        private GeminiClient $geminiClient,
        private string $model,
        private string $userAgent,
    ) {
    }

    public function extract(array $imageUrls): NutritionExtraction
    {
        if (!$this->geminiClient->isConfigured()) {
            return NutritionExtraction::failure(
                status: NutritionExtraction::STATUS_MISSING_API_KEY,
                notes: ['GEMINI_KEY is empty: every product would be skipped.'],
            );
        }

        if ([] === $imageUrls) {
            return NutritionExtraction::failure(
                status: NutritionExtraction::STATUS_NO_IMAGES,
                notes: ['The product exposes no label photos.'],
            );
        }

        $notes = [sprintf('Label images sent to Gemini: %d', count($imageUrls))];

        $images = $this->images(imageUrls: $imageUrls, notes: $notes);
        if ([] === $images) {
            return NutritionExtraction::failure(status: NutritionExtraction::STATUS_IMAGES_UNAVAILABLE, notes: $notes);
        }

        $response = $this->geminiClient->generateJson(
            prompt: self::PROMPT,
            images: $images,
            schema: $this->schema(),
            maxAttempts: self::MAX_ATTEMPTS,
            model: $this->model,
        );

        $notes = array_merge($notes, $response->notes);

        if (!$response->isSuccessful()) {
            return NutritionExtraction::failure(status: NutritionExtraction::STATUS_NO_RESPONSE, notes: $notes);
        }

        $nutrition = $this->toNutrition(data: $response->data);
        if (null === $nutrition) {
            return NutritionExtraction::failure(status: NutritionExtraction::STATUS_NOT_FOUND, notes: $notes);
        }

        if (!$nutrition->isCoherent()) {
            return NutritionExtraction::failure(status: NutritionExtraction::STATUS_INCOHERENT, notes: $notes);
        }

        return NutritionExtraction::success(nutrition: $nutrition, notes: $notes);
    }

    /**
     * @param string[] $imageUrls
     * @param string[] $notes
     *
     * @return GeminiImage[]
     */
    private function images(array $imageUrls, array &$notes): array
    {
        $images = [];
        foreach ($imageUrls as $imageUrl) {
            $bytes = $this->download(url: $imageUrl, notes: $notes);
            if (null === $bytes) {
                continue;
            }

            $image = new GeminiImage(mimeType: self::IMAGE_MIME_TYPE, bytes: $bytes);
            $notes[] = sprintf('  ok (%d KB) %s', $image->sizeInKilobytes(), $imageUrl);
            $images[] = $image;
        }

        return $images;
    }

    /**
     * @param string[] $notes
     */
    private function download(string $url, array &$notes): ?string
    {
        try {
            return $this->httpClient->request(
                method: 'GET',
                url: $url,
                options: ['headers' => ['User-Agent' => $this->userAgent]],
            )->getContent();
        } catch (ExceptionInterface $e) {
            $notes[] = sprintf('  FAILED %s (%s)', $url, $e->getMessage());

            return null;
        }
    }

    /**
     * @param array<string, mixed> $data
     */
    private function toNutrition(array $data): ?MercadonaNutrition
    {
        if (true !== ($data['found'] ?? null)) {
            return null;
        }

        return new MercadonaNutrition(
            referenceAmount: self::REFERENCE_AMOUNT,
            calories: $this->toFloat(value: $data['calories'] ?? null),
            protein: $this->toFloat(value: $data['protein'] ?? null),
            carbs: $this->toFloat(value: $data['carbs'] ?? null),
            sugars: $this->toFloat(value: $data['sugars'] ?? null),
            fat: $this->toFloat(value: $data['fat'] ?? null),
            saturatedFat: $this->toFloat(value: $data['saturatedFat'] ?? null),
            fiber: $this->toFloat(value: $data['fiber'] ?? null),
            salt: $this->toFloat(value: $data['salt'] ?? null),
            alcohol: $this->toAlcoholGrams(value: $data['alcoholVolume'] ?? null),
        );
    }

    private function toFloat(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

    private function toAlcoholGrams(mixed $value): ?float
    {
        $alcoholVolume = $this->toFloat(value: $value);
        if (null === $alcoholVolume) {
            return null;
        }

        return $alcoholVolume * self::ETHANOL_DENSITY;
    }

    /**
     * @return array<string, mixed>
     */
    private function schema(): array
    {
        $nullableNumber = ['type' => 'NUMBER', 'nullable' => true];

        return [
            'type' => 'OBJECT',
            'properties' => [
                'found' => ['type' => 'BOOLEAN'],
                'calories' => $nullableNumber,
                'protein' => $nullableNumber,
                'carbs' => $nullableNumber,
                'sugars' => $nullableNumber,
                'fat' => $nullableNumber,
                'saturatedFat' => $nullableNumber,
                'fiber' => $nullableNumber,
                'salt' => $nullableNumber,
                'alcoholVolume' => $nullableNumber,
            ],
            'required' => ['found'],
        ];
    }
}
