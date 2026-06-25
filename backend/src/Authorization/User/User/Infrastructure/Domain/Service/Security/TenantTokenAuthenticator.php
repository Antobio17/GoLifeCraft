<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Model\User;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

final class TenantTokenAuthenticator extends AbstractAuthenticator
{
    private const string HEADER_AUTHORIZATION = 'Authorization';
    private const string HEADER_AUTHORIZATION_TYPE = 'Bearer';

    public function __construct(
        private readonly UserPasswordHasherInterface $userPasswordHasher,
        private readonly TenantUserProvider $tenantUserProvider,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly JWTEncoderInterface $jwtEncoder,
    ) {
    }

    public function authenticate(Request $request): Passport
    {
        $jwt = $this->extractToken(request: $request);

        if (empty($jwt)) {
            throw new CustomUserMessageAuthenticationException(message: 'The token is an invalid');
        }

        try {
            $payload = $this->jwtEncoder->decode(token: $jwt);
        } catch (\Exception $e) {
            throw new CustomUserMessageAuthenticationException(
                message: sprintf('Invalid JWT token: %s', $e->getMessage())
            );
        }

        if (!isset($payload['sub'])) {
            throw new CustomUserMessageAuthenticationException(message: 'JWT payload is missing the user identifier ("sub").');
        }

        $userIdentifier = $payload['sub'];
        /** @var User */
        $user = $this->tenantUserProvider->loadUserByIdentifier(identifier: $userIdentifier);

        return new SelfValidatingPassport(
            userBadge: new UserBadge(userIdentifier: $userIdentifier, userLoader: function () use ($user) {
                return $user;
            })
        );
    }

    private function extractToken(Request $request): ?string
    {
        $token = $request->headers->get(key: self::HEADER_AUTHORIZATION);

        if (false === empty(self::HEADER_AUTHORIZATION_TYPE)) {
            $headerParts = explode(separator: ' ', string: $token);
            $token = $headerParts[1] ?? null;
        }

        return $token;
    }

    public function onAuthenticationFailure(
        Request $request,
        AuthenticationException $exception,
    ): Response {
        return JsonResponseBuilder::buildResponseFromBaseException(
            exception: new BaseException(
                title: $exception->getMessage(),
                keyTranslation: 'token.authentication.failed',
                details: []
            ),
            status: 0 !== $exception->getCode() ? $exception->getCode() : Response::HTTP_UNAUTHORIZED
        );
    }

    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token,
        string $firewallName,
    ): ?Response {
        return null;
    }

    public function supports(Request $request): bool
    {
        return str_starts_with(haystack: $request->getPathInfo(), needle: '/api/')
            && $request->headers->has(key: self::HEADER_AUTHORIZATION);
    }
}
