<?php

namespace Integration\OpenFoodFacts\Infrastructure\Domain\Service\Http;

use Integration\OpenFoodFacts\Domain\Model\OpenFoodFactsProduct;
use Integration\OpenFoodFacts\Domain\Service\OpenFoodFactsCatalogProvider;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

final readonly class HttpOpenFoodFactsCatalogProvider implements OpenFoodFactsCatalogProvider
{
    private const string FIELDS = 'code,product_name,brands,categories,image_url,quantity,stores,nutriments';
    private const int MAX_ATTEMPTS = 4;
    private const int RETRY_BASE_DELAY_MICROSECONDS = 1500000;
    private const int THROTTLE_DELAY_MICROSECONDS = 60000000;
    private const array THROTTLE_STATUS_CODES = [401, 429, 503];

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $baseUrl,
        private string $storeFilter,
        private string $userAgent,
    ) {
    }

    public function fetchPage(int $page, int $pageSize): array
    {
        $payload = $this->requestWithRetry(page: $page, pageSize: $pageSize);
        $rawProducts = is_array($payload['products'] ?? null) ? $payload['products'] : [];

        $products = [];
        foreach ($rawProducts as $rawProduct) {
            if (!is_array($rawProduct)) {
                continue;
            }

            $product = OpenFoodFactsProduct::fromApiData(data: $rawProduct);
            if (null !== $product) {
                $products[] = $product;
            }
        }

        return $products;
    }

    private function requestWithRetry(int $page, int $pageSize): array
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; ++$attempt) {
            try {
                return $this->httpClient->request(
                    method: 'GET',
                    url: rtrim($this->baseUrl, '/').'/api/v2/search',
                    options: [
                        'headers' => ['User-Agent' => $this->userAgent],
                        'query' => [
                            'stores_tags' => $this->storeFilter,
                            'fields' => self::FIELDS,
                            'page' => $page,
                            'page_size' => $pageSize,
                            'sort_by' => 'last_modified_t',
                        ],
                    ],
                )->toArray();
            } catch (ExceptionInterface $e) {
                $lastException = $e;

                if ($attempt >= self::MAX_ATTEMPTS) {
                    break;
                }

                $this->sleepBeforeRetry(exception: $e, attempt: $attempt);
            }
        }

        throw $lastException;
    }

    private function sleepBeforeRetry(ExceptionInterface $exception, int $attempt): void
    {
        $throttleDelay = $this->resolveThrottleDelay(exception: $exception);
        if (null !== $throttleDelay) {
            usleep($throttleDelay);

            return;
        }

        usleep(self::RETRY_BASE_DELAY_MICROSECONDS * $attempt);
    }

    private function resolveThrottleDelay(ExceptionInterface $exception): ?int
    {
        if (!$exception instanceof HttpExceptionInterface) {
            return null;
        }

        $response = $exception->getResponse();
        if (!in_array($response->getStatusCode(), self::THROTTLE_STATUS_CODES, true)) {
            return null;
        }

        return $this->retryAfterMicroseconds(response: $response) ?? self::THROTTLE_DELAY_MICROSECONDS;
    }

    private function retryAfterMicroseconds(ResponseInterface $response): ?int
    {
        $retryAfter = $response->getHeaders(throw: false)['retry-after'][0] ?? null;
        if (null === $retryAfter) {
            return null;
        }

        if (is_numeric($retryAfter)) {
            return max(0, (int) $retryAfter) * 1000000;
        }

        $timestamp = strtotime($retryAfter);
        if (false === $timestamp) {
            return null;
        }

        $seconds = $timestamp - time();

        return $seconds > 0 ? $seconds * 1000000 : null;
    }
}
