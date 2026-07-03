<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class RegisterController
{
    public function __invoke(Request $request): JsonResponse
    {
        $payload = json_decode(json: $request->getContent(), associative: true) ?? [];

        return new JsonResponse(
            data: [
                'client_id' => bin2hex(string: random_bytes(length: 16)),
                'client_id_issued_at' => time(),
                'redirect_uris' => $payload['redirect_uris'] ?? [],
                'token_endpoint_auth_method' => 'none',
                'grant_types' => ['authorization_code', 'refresh_token'],
                'response_types' => ['code'],
                'client_name' => $payload['client_name'] ?? null,
            ],
            status: Response::HTTP_CREATED
        );
    }
}
