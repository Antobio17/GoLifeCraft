<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Http;

use Integration\Mercadona\Domain\Model\MercadonaProduct;
use Integration\Mercadona\Domain\Service\MercadonaCatalogProvider;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

final readonly class HttpMercadonaCatalogProvider implements MercadonaCatalogProvider
{
    private const int MAX_ATTEMPTS = 4;
    private const int RETRY_BASE_DELAY_MICROSECONDS = 1500000;
    private const int THROTTLE_DELAY_MICROSECONDS = 30000000;
    private const array THROTTLE_STATUS_CODES = [403, 429, 503];

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $baseUrl,
        private string $warehouse,
        private string $lang,
        private string $userAgent,
    ) {
    }

    public function listProductIds(?int $categoryId = null): array
    {
        $tree = $this->request(path: '/api/categories/');
        $subcategoryIds = $this->collectSubcategoryIds(tree: $tree, onlyTopCategoryId: $categoryId);

        $ids = [];
        foreach ($subcategoryIds as $subcategoryId) {
            $detail = $this->request(path: '/api/categories/'.$subcategoryId.'/');
            foreach ($this->productIds(detail: $detail) as $productId) {
                $ids[$productId] = true;
            }
        }

        return array_map(static fn (int|string $id): int => (int) $id, array_keys($ids));
    }

    public function fetchProduct(int $id): ?MercadonaProduct
    {
        $data = $this->request(path: '/api/products/'.$id.'/');

        return MercadonaProduct::fromApiData(data: $data);
    }

    /**
     * @return int[]
     */
    private function collectSubcategoryIds(array $tree, ?int $onlyTopCategoryId): array
    {
        $results = is_array($tree['results'] ?? null) ? $tree['results'] : [];

        $ids = [];
        foreach ($results as $top) {
            if (!is_array($top)) {
                continue;
            }

            if (null !== $onlyTopCategoryId && (int) ($top['id'] ?? 0) !== $onlyTopCategoryId) {
                continue;
            }

            foreach ((is_array($top['categories'] ?? null) ? $top['categories'] : []) as $subcategory) {
                if (is_array($subcategory) && isset($subcategory['id'])) {
                    $ids[] = (int) $subcategory['id'];
                }
            }
        }

        return $ids;
    }

    /**
     * @return int[]
     */
    private function productIds(array $detail): array
    {
        $ids = [];

        foreach ((is_array($detail['products'] ?? null) ? $detail['products'] : []) as $product) {
            if (is_array($product) && isset($product['id'])) {
                $ids[] = (int) $product['id'];
            }
        }

        foreach ((is_array($detail['categories'] ?? null) ? $detail['categories'] : []) as $leaf) {
            if (!is_array($leaf)) {
                continue;
            }

            foreach ((is_array($leaf['products'] ?? null) ? $leaf['products'] : []) as $product) {
                if (is_array($product) && isset($product['id'])) {
                    $ids[] = (int) $product['id'];
                }
            }
        }

        return $ids;
    }

    private function request(string $path): array
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; ++$attempt) {
            try {
                return $this->httpClient->request(
                    method: 'GET',
                    url: rtrim($this->baseUrl, '/').$path,
                    options: [
                        'headers' => [
                            'User-Agent' => $this->userAgent,
                            'Accept' => 'application/json',
                        ],
                        'query' => [
                            'lang' => $this->lang,
                            'wh' => $this->warehouse,
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
