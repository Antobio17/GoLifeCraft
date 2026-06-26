<?php

namespace Mcp\Server\Mcp\Infrastructure\Domain\Service\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

final class McpAuthenticationEntryPoint implements AuthenticationEntryPointInterface
{
    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        $resourceMetadata = sprintf('%s/.well-known/oauth-protected-resource', $request->getSchemeAndHttpHost());

        return new JsonResponse(
            data: ['error' => 'unauthorized'],
            status: Response::HTTP_UNAUTHORIZED,
            headers: ['WWW-Authenticate' => sprintf('Bearer resource_metadata="%s"', $resourceMetadata)]
        );
    }
}
