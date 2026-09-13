<?php

namespace Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Infrastructure\Domain\Service\Security\TenantUserProvider;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

final class McpTokenAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly JWTEncoderInterface $jwtEncoder,
        private readonly TenantUserProvider $tenantUserProvider,
    ) {
    }

    public function supports(Request $request): bool
    {
        return str_starts_with(haystack: $request->getPathInfo(), needle: '/_mcp')
            && $request->headers->has(key: 'Authorization');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $this->extractToken(request: $request);

        if (null === $token || '' === $token) {
            throw new CustomUserMessageAuthenticationException(message: 'The token is invalid.');
        }

        try {
            $payload = $this->jwtEncoder->decode(token: $token);
        } catch (\Exception $exception) {
            throw new CustomUserMessageAuthenticationException(
                message: sprintf('Invalid JWT token: %s', $exception->getMessage())
            );
        }

        if (!isset($payload['sub'])) {
            throw new CustomUserMessageAuthenticationException(message: 'JWT payload is missing the user identifier ("sub").');
        }

        $user = $this->tenantUserProvider->loadUserByIdentifier(identifier: $payload['sub']);

        return new SelfValidatingPassport(
            userBadge: new UserBadge(userIdentifier: $payload['sub'], userLoader: static fn () => $user)
        );
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->headers->get(key: 'Authorization', default: '');

        if (!str_starts_with(haystack: $header, needle: 'Bearer ')) {
            return null;
        }

        return substr(string: $header, offset: 7);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return JsonResponseBuilder::buildResponseFromBaseException(
            exception: new BaseException(
                title: $exception->getMessage(),
                keyTranslation: 'mcp.authentication.failed',
                details: []
            ),
            status: Response::HTTP_UNAUTHORIZED
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }
}
