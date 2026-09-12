<?php

namespace Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security;

final class RedirectUriValidator
{
    private const array LOOPBACK_HOSTS = ['127.0.0.1', '::1', 'localhost'];

    private const array LOOPBACK_SCHEMES = ['http', 'https'];

    /**
     * @var list<string>
     */
    private readonly array $allowedHosts;

    /**
     * @param list<string> $allowedHosts
     */
    public function __construct(array $allowedHosts)
    {
        $this->allowedHosts = array_values(array_filter(array_map(
            static fn (string $host): string => strtolower(trim($host)),
            $allowedHosts,
        )));
    }

    public function isAllowed(string $redirectUri): bool
    {
        $parts = parse_url(url: $redirectUri);

        if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
            return false;
        }

        if (isset($parts['user']) || isset($parts['pass']) || isset($parts['fragment'])) {
            return false;
        }

        $scheme = strtolower($parts['scheme']);
        $host = strtolower(trim($parts['host'], '[]'));

        if (in_array($host, self::LOOPBACK_HOSTS, true)) {
            return in_array($scheme, self::LOOPBACK_SCHEMES, true);
        }

        if ('https' !== $scheme) {
            return false;
        }

        return in_array($host, $this->allowedHosts, true);
    }
}
