<?php

namespace Integration\Gemini\Client\Infrastructure\Domain\Service\Http;

use Integration\Gemini\Client\Domain\Exception\GeminiThrottledException;
use Integration\Gemini\Client\Domain\Model\GeminiResponse;
use Integration\Gemini\Client\Domain\Service\GeminiClient;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class HttpGeminiClient implements GeminiClient
{
    private const int RETRY_BASE_DELAY_MICROSECONDS = 2000000;
    private const array THROTTLE_STATUS_CODES = [429, 500, 503];

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $baseUrl,
        private string $apiKey,
        private string $model,
        private string $userAgent,
        private int $timeoutInSeconds,
    ) {
    }

    public function isConfigured(): bool
    {
        return '' !== $this->apiKey;
    }

    public function generateJson(
        string $prompt,
        array $images,
        array $schema,
        int $maxAttempts = 1,
        ?string $model = null,
    ): GeminiResponse {
        $parts = [];
        foreach ($images as $image) {
            $parts[] = [
                'inline_data' => [
                    'mime_type' => $image->mimeType,
                    'data' => base64_encode($image->bytes),
                ],
            ];
        }

        $parts[] = ['text' => $prompt];

        $payload = [
            'contents' => [['parts' => $parts]],
            'generationConfig' => [
                'temperature' => 0,
                'responseMimeType' => 'application/json',
                'responseSchema' => $schema,
            ],
        ];

        $notes = [];
        $response = $this->requestWithRetry(
            payload: $payload,
            maxAttempts: max(1, $maxAttempts),
            model: $model ?? $this->model,
            notes: $notes,
        );

        if (null === $response) {
            return GeminiResponse::failure(notes: $notes);
        }

        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!is_string($text)) {
            $notes[] = 'Gemini replied without usable text: '.self::truncate(value: json_encode($response, JSON_UNESCAPED_UNICODE));

            return GeminiResponse::failure(notes: $notes);
        }

        $decoded = json_decode($text, true);
        if (!is_array($decoded)) {
            $notes[] = 'Gemini text is not valid JSON: '.self::truncate(value: $text);

            return GeminiResponse::failure(notes: $notes);
        }

        $notes[] = 'Gemini answered: '.self::truncate(value: json_encode($decoded, JSON_UNESCAPED_UNICODE));

        return GeminiResponse::success(data: $decoded, notes: $notes);
    }

    /**
     * @param array<string, mixed> $payload
     * @param string[]             $notes
     *
     * @return array<string, mixed>|null
     */
    private function requestWithRetry(array $payload, int $maxAttempts, string $model, array &$notes): ?array
    {
        $url = rtrim($this->baseUrl, '/').'/v1beta/models/'.$model.':generateContent';

        for ($attempt = 1; $attempt <= $maxAttempts; ++$attempt) {
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
                        'timeout' => $this->timeoutInSeconds,
                        'max_duration' => $this->timeoutInSeconds,
                    ],
                )->toArray();
            } catch (ExceptionInterface $e) {
                $this->abortOnThrottle(exception: $e);

                $notes[] = sprintf('Gemini call failed (attempt %d/%d) on %s: %s', $attempt, $maxAttempts, $url, $this->describeFailure(exception: $e));

                if ($attempt >= $maxAttempts) {
                    return null;
                }

                usleep(self::RETRY_BASE_DELAY_MICROSECONDS * $attempt);
            }
        }

        return null;
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

        throw GeminiThrottledException::forStatus(statusCode: $statusCode);
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
}
