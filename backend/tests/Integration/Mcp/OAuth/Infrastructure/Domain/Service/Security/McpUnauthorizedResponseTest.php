<?php

namespace App\Tests\Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\Service\Security\TenantUserProvider;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security\McpAuthenticationEntryPoint;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security\McpTokenAuthenticator;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;

final class McpUnauthorizedResponseTest extends TestCase
{
    public function testTheEntryPointPointsTheClientAtTheResourceMetadata(): void
    {
        $response = (new McpAuthenticationEntryPoint())->start(request: $this->mcpRequest());

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertSame(
            'Bearer resource_metadata="https://golifecraft.com/.well-known/oauth-protected-resource"',
            $response->headers->get('WWW-Authenticate')
        );
    }

    public function testAnExpiredTokenIsAnsweredWithTheSameChallenge(): void
    {
        $authenticator = new McpTokenAuthenticator(
            jwtEncoder: $this->createMock(JWTEncoderInterface::class),
            tenantUserProvider: new TenantUserProvider(userRepository: new InMemoryUserRepository()),
        );

        $response = $authenticator->onAuthenticationFailure(
            request: $this->mcpRequest(),
            exception: new CustomUserMessageAuthenticationException(message: 'Invalid JWT token: Expired JWT Token'),
        );

        self::assertSame(Response::HTTP_UNAUTHORIZED, $response->getStatusCode());
        self::assertSame(
            'Bearer error="invalid_token", resource_metadata="https://golifecraft.com/.well-known/oauth-protected-resource"',
            $response->headers->get('WWW-Authenticate')
        );
    }

    private function mcpRequest(): Request
    {
        return Request::create(uri: 'https://golifecraft.com/_mcp', method: 'POST');
    }
}
