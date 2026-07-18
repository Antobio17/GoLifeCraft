<?php

namespace Integration\OpenFoodFacts\Infrastructure\Domain\Service\Http;

use Integration\OpenFoodFacts\Domain\Model\OpenFoodFactsProduct;
use Integration\OpenFoodFacts\Domain\Service\OpenFoodFactsCatalogProvider;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class HttpOpenFoodFactsCatalogProvider implements OpenFoodFactsCatalogProvider
{
    private const string FIELDS = 'code,product_name,brands,categories,image_url,quantity,stores,nutriments';
    private const int MAX_ATTEMPTS = 4;
    private const int RETRY_BASE_DELAY_MICROSECONDS = 1500000;

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

                if ($attempt < self::MAX_ATTEMPTS) {
                    usleep(self::RETRY_BASE_DELAY_MICROSECONDS * $attempt);
                }
            }
        }

        throw $lastException;
    }
}
