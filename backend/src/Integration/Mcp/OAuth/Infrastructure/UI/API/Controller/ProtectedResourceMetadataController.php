<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final class ProtectedResourceMetadataController
{
    public function __invoke(Request $request): JsonResponse
    {
        $issuer = $request->getSchemeAndHttpHost();

        return new JsonResponse(data: [
            'resource' => sprintf('%s/_mcp', $issuer),
            'authorization_servers' => [$issuer],
        ]);
    }
}
