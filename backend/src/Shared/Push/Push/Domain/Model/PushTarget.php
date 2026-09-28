<?php

namespace Shared\Push\Push\Domain\Model;

final readonly class PushTarget
{
    public function __construct(
        public string $endpoint,
        public string $publicKey,
        public string $authToken,
        public string $contentEncoding,
    ) {
    }
}
