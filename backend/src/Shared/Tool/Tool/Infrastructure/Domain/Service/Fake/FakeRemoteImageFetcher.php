<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Fake;

use Shared\Tool\Tool\Domain\Service\FetchedImage;
use Shared\Tool\Tool\Domain\Service\RemoteImageFetcher;

final class FakeRemoteImageFetcher implements RemoteImageFetcher
{
    /** @var string[] */
    public array $fetchedUrls = [];

    public function __construct(
        public ?FetchedImage $image = null,
    ) {
    }

    public function fetch(string $url): ?FetchedImage
    {
        $this->fetchedUrls[] = $url;

        return $this->image;
    }
}
