<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Gemini;

use Integration\Mercadona\Domain\Exception\MercadonaThrottledException;
use Integration\Mercadona\Domain\Model\MercadonaNutrition;
use Integration\Mercadona\Domain\Model\NutritionExtraction;
use Integration\Mercadona\Domain\Service\MercadonaNutritionExtractor;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class GeminiNutritionExtractor implements MercadonaNutritionExtractor
{
    private const string SERVICE = 'Gemini';
    private const float REFERENCE_AMOUNT = 100.0;
    private const int MAX_ATTEMPTS = 2;
    private const int RETRY_BASE_DELAY_MICROSECONDS = 2000000;
    private const array THROTTLE_STATUS_CODES = [429, 500, 503];
    private const string PROMPT = <<<'PROMPT'
        Eres un extractor de información nutricional. En las imágenes aparece la etiqueta de un producto de alimentación de supermercado.
        Localiza la tabla de "Información nutricional" y devuelve los valores POR 100 g o POR 100 ml (nunca por ración).
        Devuelve únicamente los campos: found, calories (kcal), protein, carbs, sugars, fat, saturatedFat, fiber, salt (todos en gramos por 100, salvo calories en kcal, con punto decimal).
        Reglas:
        - found = true solo si localizas la tabla y es legible por 100 g/ml. Si no hay tabla, es ilegible, o solo aparece por ración, found = false.
        - Si un campo concreto no aparece en la etiqueta, ponlo a null. No inventes ni estimes ningún valor.
        PROMPT;

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $baseUrl,
        private string $apiKey,
        private string $model,
        private string $userAgent,
    ) {
    }

    public function extract(array $imageUrls): NutritionExtraction
    {
        if ('' === $this->apiKey) {
            return NutritionExtraction::failure(
                status: NutritionExtraction::STATUS_MISSING_API_KEY,
                notes: ['MERCADONA_GEMINI_KEY is empty: every product would be skipped.'],
            );
        }

        if ([] === $imageUrls) {
            return NutritionExtraction::failure(
                status: NutritionExtraction::STATUS_NO_IMAGES,
                notes: ['The product exposes no label photos.'],
            );
        }

        $notes = [sprintf('Label images sent to Gemini: %d', count($imageUrls))];

        $parts = $this->imageParts(imageUrls: $imageUrls, notes: $notes);
        if ([] === $parts) {
            return NutritionExtraction::failure(status: NutritionExtraction::STATUS_IMAGES_UNAVAILABLE, notes: $notes);
        }

        $parts[] = ['text' => self::PROMPT];

        $data = $this->generate(parts: $parts, notes: $notes);
        if (null === $data) {
            return NutritionExtraction::failure(status: NutritionExtraction::STATUS_NO_RESPONSE, notes: $notes);
        }

        $notes[] = 'Gemini answered: '.json_encode($data, JSON_UNESCAPED_UNICODE);

        $nutrition = $this->toNutrition(data: $data);
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
     * @return array<int, array{inline_data: array{mime_type: string, data: string}}>
     */
    private function imageParts(array $imageUrls, array &$notes): array
    {
        $parts = [];
        foreach ($imageUrls as $imageUrl) {
            $bytes = $this->download(url: $imageUrl, notes: $notes);
            if (null === $bytes) {
                continue;
            }

            $notes[] = sprintf('  ok (%d KB) %s', intdiv(strlen($bytes), 1024), $imageUrl);

            $parts[] = [
                'inline_data' => [
                    'mime_type' => 'image/jpeg',
                    'data' => base64_encode($bytes),
                ],
            ];
        }

        return $parts;
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
     * @param array<int, array<string, mixed>> $parts
     */
    /**
     * @param array<int, array<string, mixed>> $parts
     * @param string[]                         $notes
     */
    private function generate(array $parts, array &$notes): ?array
    {
        $payload = [
            'contents' => [['parts' => $parts]],
            'generationConfig' => [
                'temperature' => 0,
                'responseMimeType' => 'application/json',
                'responseSchema' => $this->schema(),
            ],
        ];

        $response = $this->requestWithRetry(payload: $payload, notes: $notes);
        if (null === $response) {
            return null;
        }

        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!is_string($text)) {
            $notes[] = 'Gemini replied without usable text: '.self::truncate(value: json_encode($response, JSON_UNESCAPED_UNICODE));

            return null;
        }

        $decoded = json_decode($text, true);
        if (!is_array($decoded)) {
            $notes[] = 'Gemini text is not valid JSON: '.self::truncate(value: $text);

            return null;
        }

        return $decoded;
    }

    /**
     * @param string[] $notes
     */
    private function requestWithRetry(array $payload, array &$notes): ?array
    {
        $url = rtrim($this->baseUrl, '/').'/v1beta/models/'.$this->model.':generateContent';

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; ++$attempt) {
            try {
                return $this->httpClient->request(
                    method: 'POST',
                    url: $url,
                    options: [
                        'headers' => [
                            'x-goog-api-key' => $this->apiKey,
                            'Content-Type' => 'application/json',
                            'User-Agent' => $this->userAgent,
                        ],
                        'json' => $payload,
                    ],
                )->toArray();
            } catch (ExceptionInterface $e) {
                $this->abortOnThrottle(exception: $e);

                $notes[] = sprintf('Gemini call failed (attempt %d/%d) on %s: %s', $attempt, self::MAX_ATTEMPTS, $url, $this->describeFailure(exception: $e));

                if ($attempt >= self::MAX_ATTEMPTS) {
                    return null;
                }

                usleep(self::RETRY_BASE_DELAY_MICROSECONDS * $attempt);
            }
        }

        return null;
    }

    private function describeFailure(ExceptionInterface $exception): string
    {
        if (!$exception instanceof HttpExceptionInterface) {
            return $exception->getMessage();
        }

        $response = $exception->getResponse();

        return sprintf('HTTP %d — %s', $response->getStatusCode(), self::truncate(value: $response->getContent(throw: false)));
    }

    private static function truncate(string|false $value): string
    {
        if (false === $value) {
            return '(empty)';
        }

        return mb_strimwidth(trim($value), 0, 600, '…');
    }

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
        );
    }

    private function toFloat(mixed $value): ?float
    {
        return is_numeric($value) ? (float) $value : null;
    }

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
            ],
            'required' => ['found'],
        ];
    }

    private function abortOnThrottle(ExceptionInterface $exception): void
    {
        if (!$exception instanceof HttpExceptionInterface) {
            return;
        }

        $statusCode = $exception->getResponse()->getStatusCode();
        if (!in_array($statusCode, self::THROTTLE_STATUS_CODES, true)) {
            return;
        }

        throw MercadonaThrottledException::forStatus(service: self::SERVICE, statusCode: $statusCode);
    }
}
