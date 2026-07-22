<?php

namespace Integration\Mercadona\Infrastructure\Domain\Service\Http;

use Integration\Mercadona\Domain\Exception\MercadonaThrottledException;
use Integration\Mercadona\Domain\Model\MercadonaProduct;
use Integration\Mercadona\Domain\Service\MercadonaCatalogProvider;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class HttpMercadonaCatalogProvider implements MercadonaCatalogProvider
{
    private const string SERVICE = 'Mercadona';
    private const int MAX_ATTEMPTS = 2;
    private const int RETRY_BASE_DELAY_MICROSECONDS = 1500000;
    private const array THROTTLE_STATUS_CODES = [403, 429, 503];

    public function __construct(
        private HttpClientInterface $httpClient,
        private string $baseUrl,
        private string $warehouse,
        private string $lang,
        private string $userAgent,
    ) {
    }

    public function listSubcategoryIds(?int $categoryId = null): array
    {
        $tree = $this->request(path: '/api/categories/');

        return $this->collectSubcategoryIds(tree: $tree, onlyTopCategoryId: $categoryId);
    }

    public function listProductIdsInSubcategory(int $subcategoryId): array
    {
        $detail = $this->request(path: '/api/categories/'.$subcategoryId.'/');

        $ids = [];
        foreach ($this->productIds(detail: $detail) as $productId) {
            $ids[$productId] = true;
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
                $this->abortOnThrottle(exception: $e);

                $lastException = $e;

                if ($attempt >= self::MAX_ATTEMPTS) {
                    break;
                }

                usleep(self::RETRY_BASE_DELAY_MICROSECONDS * $attempt);
            }
        }

        throw $lastException;
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
