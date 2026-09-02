<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Http;

use Shared\Tool\Tool\Domain\Service\FetchedImage;
use Shared\Tool\Tool\Domain\Service\RemoteImageFetcher;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final readonly class HttpRemoteImageFetcher implements RemoteImageFetcher
{
    private const array EXTENSIONS_BY_MIME_TYPE = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    public function __construct(
        private HttpClientInterface $httpClient,
        private int $maxBytes,
        private int $timeout,
    ) {
    }

    public function fetch(string $url): ?FetchedImage
    {
        try {
            $response = $this->httpClient->request(
                method: 'GET',
                url: $url,
                options: ['timeout' => $this->timeout],
            );

            if (200 !== $response->getStatusCode()) {
                return null;
            }

            $content = $response->getContent();
        } catch (\Throwable $e) {
            return null;
        }

        if ('' === $content || strlen($content) > $this->maxBytes) {
            return null;
        }

        $extension = $this->extension(content: $content);

        if (null === $extension) {
            return null;
        }

        $path = sprintf('%s/%s.%s', sys_get_temp_dir(), uniqid(prefix: 'remote_image_', more_entropy: true), $extension);

        if (false === file_put_contents(filename: $path, data: $content)) {
            return null;
        }

        return new FetchedImage(path: $path, extension: $extension);
    }

    private function extension(string $content): ?string
    {
        $mimeType = (new \finfo(flags: FILEINFO_MIME_TYPE))->buffer(string: $content);

        return self::EXTENSIONS_BY_MIME_TYPE[$mimeType] ?? null;
    }
}
