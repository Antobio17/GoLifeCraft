<?php

namespace Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security;

use Symfony\Component\HttpFoundation\Request;

final class ProtectedResourceChallenge
{
    public static function header(Request $request, ?string $error = null): string
    {
        $resourceMetadata = sprintf('%s/.well-known/oauth-protected-resource', $request->getSchemeAndHttpHost());

        if (null === $error) {
            return sprintf('Bearer resource_metadata="%s"', $resourceMetadata);
        }

        return sprintf('Bearer error="%s", resource_metadata="%s"', $error, $resourceMetadata);
    }
}
