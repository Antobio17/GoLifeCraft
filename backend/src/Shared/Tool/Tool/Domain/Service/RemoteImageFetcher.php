<?php

namespace Shared\Tool\Tool\Domain\Service;

interface RemoteImageFetcher
{
    public function fetch(string $url): ?FetchedImage;
}
