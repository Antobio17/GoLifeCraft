<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Gemini;

use Integration\Mercadona\Domain\Exception\MercadonaThrottledException;
use Integration\Mercadona\Domain\Model\MercadonaNutrition;
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

    public function extract(array $imageUrls): ?MercadonaNutrition
    {
        if ([] === $imageUrls || '' === $this->apiKey) {
            return null;
        }

        $parts = $this->imageParts(imageUrls: $imageUrls);
        if ([] === $parts) {
            return null;
        }

        $parts[] = ['text' => self::PROMPT];

        $data = $this->generate(parts: $parts);
        if (null === $data) {
            return null;
        }

        $nutrition = $this->toNutrition(data: $data);
        if (null === $nutrition || !$nutrition->isCoherent()) {
            return null;
        }

        return $nutrition;
    }

    /**
     * @param string[] $imageUrls
     *
     * @return array<int, array{inline_data: array{mime_type: string, data: string}}>
     */
    private function imageParts(array $imageUrls): array
    {
        $parts = [];
        foreach ($imageUrls as $imageUrl) {
            $bytes = $this->download(url: $imageUrl);
            if (null === $bytes) {
                continue;
            }

            $parts[] = [
                'inline_data' => [
                    'mime_type' => 'image/jpeg',
                    'data' => base64_encode($bytes),
                ],
            ];
        }

        return $parts;
    }

    private function download(string $url): ?string
    {
        try {
            return $this->httpClient->request(
                method: 'GET',
                url: $url,
                options: ['headers' => ['User-Agent' => $this->userAgent]],
            )->getContent();
        } catch (ExceptionInterface) {
            return null;
        }
    }

    /**
     * @param array<int, array<string, mixed>> $parts
     */
    private function generate(array $parts): ?array
    {
        $payload = [
            'contents' => [['parts' => $parts]],
            'generationConfig' => [
                'temperature' => 0,
                'responseMimeType' => 'application/json',
                'responseSchema' => $this->schema(),
            ],
        ];

        $response = $this->requestWithRetry(payload: $payload);
        if (null === $response) {
            return null;
        }

        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!is_string($text)) {
            return null;
        }

        $decoded = json_decode($text, true);

        return is_array($decoded) ? $decoded : null;
    }

    private function requestWithRetry(array $payload): ?array
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

                if ($attempt >= self::MAX_ATTEMPTS) {
                    return null;
                }

                usleep(self::RETRY_BASE_DELAY_MICROSECONDS * $attempt);
            }
        }

        return null;
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
