<?php

namespace Shared\Push\Push\Domain\Model;

final readonly class PushDeliveryReport
{
    /**
     * @param string[] $deliveredEndpoints
     * @param string[] $expiredEndpoints
     * @param string[] $failedEndpoints
     */
    public function __construct(
        public array $deliveredEndpoints = [],
        public array $expiredEndpoints = [],
        public array $failedEndpoints = [],
    ) {
    }

    public function isExpired(string $endpoint): bool
    {
        return in_array(needle: $endpoint, haystack: $this->expiredEndpoints, strict: true);
    }
}
