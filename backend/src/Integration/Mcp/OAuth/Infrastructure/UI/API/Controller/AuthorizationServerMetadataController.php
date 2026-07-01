<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final class AuthorizationServerMetadataController
{
    public function __invoke(Request $request): JsonResponse
    {
        $issuer = $request->getSchemeAndHttpHost();

        return new JsonResponse(data: [
            'issuer' => $issuer,
            'authorization_endpoint' => sprintf('%s/oauth/authorize', $issuer),
            'token_endpoint' => sprintf('%s/oauth/token', $issuer),
            'registration_endpoint' => sprintf('%s/oauth/register', $issuer),
            'response_types_supported' => ['code'],
            'grant_types_supported' => ['authorization_code'],
            'code_challenge_methods_supported' => ['S256'],
            'token_endpoint_auth_methods_supported' => ['none'],
        ]);
    }
}
